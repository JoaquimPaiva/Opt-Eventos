import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';
import RateForm from './Partials/RateForm';

interface HotelOption {
    id: number;
    name: string;
    event_name: string;
}

interface RoomTypeOption {
    id: number;
    name: string;
}

interface MealPlanOption {
    id: number;
    name: string;
}

interface RatePayload {
    id: number;
    hotel_id: number;
    room_type_id: number;
    meal_plan_id: number;
    cost_price: string;
    sale_price: string;
    currency: string;
    stock: number;
    cancellation_deadline: string;
    is_active: boolean;
}

interface RateEditProps {
    hotels: HotelOption[];
    room_types: RoomTypeOption[];
    meal_plans: MealPlanOption[];
    rate: RatePayload;
}

export default function RateEdit({ hotels, room_types, meal_plans, rate }: RateEditProps) {
    const { data, setData, put, processing, errors } = useForm({
        hotel_id: rate.hotel_id.toString(),
        room_type_id: rate.room_type_id.toString(),
        meal_plan_id: rate.meal_plan_id.toString(),
        cost_price: rate.cost_price,
        sale_price: rate.sale_price,
        currency: rate.currency,
        stock: rate.stock.toString(),
        cancellation_deadline: rate.cancellation_deadline,
        is_active: rate.is_active,
    });

    const submit = (event: FormEvent) => {
        event.preventDefault();
        put(route('admin.rates.update', rate.id));
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Editar Tarifa</h2>}
        >
            <Head title={`Editar Tarifa ${rate.id}`} />

            <div className="py-10">
                <div className="mx-auto max-w-4xl space-y-4 px-4 sm:px-6 lg:px-8">
                    <Link
                        href={route('admin.rates.index')}
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                    >
                        Voltar às tarifas
                    </Link>

                    <div className="rounded-lg bg-white p-6 shadow-sm">
                        <RateForm
                            data={data}
                            setData={setData}
                            errors={errors}
                            processing={processing}
                            hotels={hotels}
                            room_types={room_types}
                            meal_plans={meal_plans}
                            onSubmit={submit}
                            submitLabel="Atualizar tarifa"
                        />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
