<?php

declare(strict_types=1);

/**
 * Convert Laravel SQLite database into a MySQL-compatible SQL dump.
 *
 * Usage:
 *   php database/sqlite_to_mysql.php [sqlite_path] [output_sql_path]
 *
 * Defaults:
 *   sqlite_path: database/database.sqlite
 *   output_sql_path: database/export_mysql.sql
 */

$baseDir = dirname(__DIR__);
$sqlitePath = $argv[1] ?? $baseDir.'/database/database.sqlite';
$outputPath = $argv[2] ?? $baseDir.'/database/export_mysql.sql';

if (! is_file($sqlitePath)) {
    fwrite(STDERR, "SQLite database not found: {$sqlitePath}\n");
    exit(1);
}

$sqlite = new PDO('sqlite:'.$sqlitePath);
$sqlite->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$skipTables = ['sqlite_sequence'];

$tables = $sqlite->query("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
    ->fetchAll(PDO::FETCH_COLUMN);

$lines = [];
$deferredForeignKeys = [];
$lines[] = '-- Auto-generated from SQLite to MySQL';
$lines[] = '-- Generated at: '.date('Y-m-d H:i:s');
$lines[] = 'SET NAMES utf8mb4;';
$lines[] = 'SET FOREIGN_KEY_CHECKS=0;';
$lines[] = '';

foreach ($tables as $table) {
    if (in_array($table, $skipTables, true)) {
        continue;
    }

    $tableName = quoteIdentifier($table);
    $columnsInfo = $sqlite->query('PRAGMA table_info('.quoteSqliteIdentifier($table).')')
        ->fetchAll(PDO::FETCH_ASSOC);
    $foreignKeys = $sqlite->query('PRAGMA foreign_key_list('.quoteSqliteIdentifier($table).')')
        ->fetchAll(PDO::FETCH_ASSOC);
    $indexes = $sqlite->query('PRAGMA index_list('.quoteSqliteIdentifier($table).')')
        ->fetchAll(PDO::FETCH_ASSOC);

    $pkColumns = [];
    foreach ($columnsInfo as $col) {
        if ((int) $col['pk'] > 0) {
            $pkColumns[(int) $col['pk']] = $col['name'];
        }
    }
    ksort($pkColumns);
    $pkColumns = array_values($pkColumns);

    $singleIntegerPkAutoincrement = count($pkColumns) === 1
        && isIntegerLikeColumn($columnsInfo, $pkColumns[0]);

    $columnLines = [];
    foreach ($columnsInfo as $col) {
        $name = $col['name'];
        $type = normalizeMySqlType((string) $col['type'], $name);
        $nullable = ((int) $col['notnull'] === 1) ? 'NOT NULL' : 'NULL';
        $default = buildDefault((string) $col['dflt_value']);

        $line = '  '.quoteIdentifier($name).' '.$type.' '.$nullable;
        if ($default !== null) {
            $line .= ' DEFAULT '.$default;
        }
        if ($singleIntegerPkAutoincrement && $name === $pkColumns[0]) {
            $line .= ' AUTO_INCREMENT';
        }

        $columnLines[] = $line;
    }

    if (count($pkColumns) > 0) {
        $columnLines[] = '  PRIMARY KEY ('.implode(', ', array_map('quoteIdentifier', $pkColumns)).')';
    }

    $lines[] = "DROP TABLE IF EXISTS {$tableName};";
    $lines[] = "CREATE TABLE {$tableName} (";
    $lines[] = implode(",\n", $columnLines);
    $lines[] = ') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;';
    $lines[] = '';

    foreach ($foreignKeys as $fkIndex => $fk) {
        $from = quoteIdentifier((string) $fk['from']);
        $toTable = quoteIdentifier((string) $fk['table']);
        $to = quoteIdentifier((string) $fk['to']);
        $onDelete = strtoupper((string) $fk['on_delete']) ?: 'RESTRICT';
        $onUpdate = strtoupper((string) $fk['on_update']) ?: 'RESTRICT';
        $constraint = buildConstraintName($table, (string) $fk['from'], $fkIndex);

        $deferredForeignKeys[] = "ALTER TABLE {$tableName} ADD CONSTRAINT ".quoteIdentifier($constraint)." FOREIGN KEY ({$from}) REFERENCES {$toTable} ({$to}) ON DELETE {$onDelete} ON UPDATE {$onUpdate};";
    }

    foreach ($indexes as $index) {
        $indexName = (string) $index['name'];
        if ($indexName === 'PRIMARY' || str_starts_with($indexName, 'sqlite_autoindex_')) {
            continue;
        }

        $indexColsRows = $sqlite->query('PRAGMA index_info('.quoteSqliteIdentifier($indexName).')')
            ->fetchAll(PDO::FETCH_ASSOC);
        $indexCols = array_map(
            static fn (array $row): string => quoteIdentifier((string) $row['name']),
            $indexColsRows
        );

        if (count($indexCols) === 0) {
            continue;
        }

        $unique = ((int) $index['unique'] === 1) ? 'UNIQUE ' : '';
        $lines[] = "CREATE {$unique}INDEX ".quoteIdentifier($indexName)." ON {$tableName} (".implode(', ', $indexCols).");";
    }
    $lines[] = '';

    $stmt = $sqlite->query('SELECT * FROM '.quoteSqliteIdentifier($table));
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    if (count($rows) === 0) {
        continue;
    }

    $columns = array_keys($rows[0]);
    $columnsSql = implode(', ', array_map('quoteIdentifier', $columns));

    foreach ($rows as $row) {
        $values = [];
        foreach ($columns as $colName) {
            $value = $row[$colName];
            if ($value === null) {
                $values[] = 'NULL';
            } elseif (is_numeric($value) && ! isDateLikeColumn($colName, $columnsInfo)) {
                $values[] = (string) $value;
            } else {
                $values[] = "'".str_replace("'", "''", (string) $value)."'";
            }
        }

        $lines[] = "INSERT INTO {$tableName} ({$columnsSql}) VALUES (".implode(', ', $values).');';
    }
    $lines[] = '';
}

$lines[] = '-- Foreign keys';
foreach ($deferredForeignKeys as $foreignKeySql) {
    $lines[] = $foreignKeySql;
}
$lines[] = '';
$lines[] = 'SET FOREIGN_KEY_CHECKS=1;';
$lines[] = '';

file_put_contents($outputPath, implode("\n", $lines));

fwrite(STDOUT, "MySQL dump generated: {$outputPath}\n");

/**
 * @param array<int, array<string, mixed>> $columnsInfo
 */
function isIntegerLikeColumn(array $columnsInfo, string $columnName): bool
{
    foreach ($columnsInfo as $col) {
        if ((string) $col['name'] !== $columnName) {
            continue;
        }

        $type = strtolower((string) $col['type']);
        return str_contains($type, 'int');
    }

    return false;
}

/**
 * @param array<int, array<string, mixed>> $columnsInfo
 */
function isDateLikeColumn(string $columnName, array $columnsInfo): bool
{
    $name = strtolower($columnName);
    if (str_contains($name, 'date') || str_ends_with($name, '_at')) {
        return true;
    }

    foreach ($columnsInfo as $col) {
        if ((string) $col['name'] !== $columnName) {
            continue;
        }

        $type = strtolower((string) $col['type']);
        return str_contains($type, 'date') || str_contains($type, 'time');
    }

    return false;
}

function normalizeMySqlType(string $sqliteType, string $columnName): string
{
    $type = strtolower(trim($sqliteType));
    $name = strtolower($columnName);

    if ($type === '') {
        return 'TEXT';
    }
    if (str_contains($type, 'tinyint(1)')) {
        return 'TINYINT(1)';
    }
    if (str_contains($type, 'int')) {
        return 'INT';
    }
    if (str_contains($type, 'numeric') || str_contains($type, 'decimal')) {
        return 'DECIMAL(12,2)';
    }
    if (str_contains($type, 'double') || str_contains($type, 'float') || str_contains($type, 'real')) {
        return 'DOUBLE';
    }
    if (str_contains($type, 'datetime') || str_contains($type, 'timestamp')) {
        return 'DATETIME';
    }
    if (str_contains($type, 'date')) {
        return 'DATE';
    }
    if (str_contains($type, 'text')) {
        return 'LONGTEXT';
    }
    if (str_contains($type, 'char') || str_contains($type, 'varchar')) {
        if ($name === 'id' && str_starts_with($type, 'varchar')) {
            return 'VARCHAR(191)';
        }
        return 'VARCHAR(255)';
    }

    return 'LONGTEXT';
}

function buildDefault(string $sqliteDefaultRaw): ?string
{
    $value = trim($sqliteDefaultRaw);
    if ($value === '') {
        return null;
    }

    $upper = strtoupper($value);
    if ($upper === 'NULL') {
        return 'NULL';
    }
    if ($upper === 'CURRENT_TIMESTAMP') {
        return 'CURRENT_TIMESTAMP';
    }
    if (is_numeric($value)) {
        return $value;
    }

    // Remove outer single quotes if present.
    if (str_starts_with($value, "'") && str_ends_with($value, "'")) {
        $value = substr($value, 1, -1);
    }

    return "'".str_replace("'", "''", $value)."'";
}

function quoteIdentifier(string $identifier): string
{
    return '`'.str_replace('`', '``', $identifier).'`';
}

function quoteSqliteIdentifier(string $identifier): string
{
    return '"'.str_replace('"', '""', $identifier).'"';
}

function buildConstraintName(string $table, string $column, int $index): string
{
    $base = strtolower("fk_{$table}_{$column}_{$index}");
    $clean = preg_replace('/[^a-z0-9_]+/', '_', $base) ?? $base;

    return substr($clean, 0, 60);
}
