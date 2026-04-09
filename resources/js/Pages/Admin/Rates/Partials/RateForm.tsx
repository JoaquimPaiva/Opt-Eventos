import { FormEvent, ReactNode } from 'react';

type HotelOption = { id: number; name: string; event_name: string };
type RoomTypeOption = { id: number; name: string };
type MealPlanOption = { id: number; name: string };

type RateFormData = {
    hotel_id: string;
    room_type_id: string;
    meal_plan_id: string;
    cost_price: string;
    sale_price: string;
    currency: string;
    stock: string;
    cancellation_deadline: string;
    is_active: boolean;
};

type RateFormErrors = Partial<Record<keyof RateFormData, string>>;

interface RateFormProps {
    data: RateFormData;
    setData: <K extends keyof RateFormData>(key: K, value: RateFormData[K]) => void;
    errors: RateFormErrors;
    processing: boolean;
    hotels: HotelOption[];
    room_types: RoomTypeOption[];
    meal_plans: MealPlanOption[];
    onSubmit: (event: FormEvent) => void;
    submitLabel: string;
}

export default function RateForm({
    data,
    setData,
    errors,
    processing,
    hotels,
    room_types,
    meal_plans,
    onSubmit,
    submitLabel,
}: RateFormProps) {
    return (
        <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
                <Field label="Hotel" error={errors.hotel_id}>
                    <select
                        value={data.hotel_id}
                        onChange={(event) => setData('hotel_id', event.target.value)}
                        className="w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                        <option value="">Selecionar hotel</option>
                        {hotels.map((hotel) => (
                            <option key={hotel.id} value={hotel.id}>
                                {hotel.name} ({hotel.event_name})
                            </option>
                        ))}
                    </select>
                </Field>

                <Field label="Tipo de quarto" error={errors.room_type_id}>
                    <select
                        value={data.room_type_id}
                        onChange={(event) => setData('room_type_id', event.target.value)}
                        className="w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                        <option value="">Selecionar tipo de quarto</option>
                        {room_types.map((roomType) => (
                            <option key={roomType.id} value={roomType.id}>
                                {roomType.name}
                            </option>
                        ))}
                    </select>
                </Field>

                <Field label="Regime" error={errors.meal_plan_id}>
                    <select
                        value={data.meal_plan_id}
                        onChange={(event) => setData('meal_plan_id', event.target.value)}
                        className="w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                        <option value="">Selecionar regime</option>
                        {meal_plans.map((mealPlan) => (
                            <option key={mealPlan.id} value={mealPlan.id}>
                                {mealPlan.name}
                            </option>
                        ))}
                    </select>
                </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
                <Field label="Preço de custo" error={errors.cost_price}>
                    <input
                        type="number"
                        step="0.01"
                        value={data.cost_price}
                        onChange={(event) => setData('cost_price', event.target.value)}
                        className="w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                </Field>

                <Field label="Preço de venda" error={errors.sale_price}>
                    <input
                        type="number"
                        step="0.01"
                        value={data.sale_price}
                        onChange={(event) => setData('sale_price', event.target.value)}
                        className="w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                </Field>

                <Field label="Moeda" error={errors.currency}>
                    <input
                        type="text"
                        maxLength={3}
                        value={data.currency}
                        onChange={(event) => setData('currency', event.target.value.toUpperCase())}
                        className="w-full rounded-md border-gray-300 text-sm uppercase shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                </Field>

                <Field label="Stock" error={errors.stock}>
                    <input
                        type="number"
                        min={0}
                        value={data.stock}
                        onChange={(event) => setData('stock', event.target.value)}
                        className="w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                </Field>
            </div>

            <Field label="Prazo de cancelamento" error={errors.cancellation_deadline}>
                <input
                    type="datetime-local"
                    value={data.cancellation_deadline}
                    onChange={(event) => setData('cancellation_deadline', event.target.value)}
                    className="w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
            </Field>

            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                <input
                    type="checkbox"
                    checked={data.is_active}
                    onChange={(event) => setData('is_active', event.target.checked)}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                Tarifa ativa
            </label>

            <div>
                <button
                    type="submit"
                    disabled={processing}
                    className="rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {processing ? 'A guardar...' : submitLabel}
                </button>
            </div>
        </form>
    );
}

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
    return (
        <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
            {children}
            {error ? <p className="mt-1 text-sm text-red-600">{error}</p> : null}
        </div>
    );
}
