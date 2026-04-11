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

interface RateCreateProps {
    hotels: HotelOption[];
    room_types: RoomTypeOption[];
    meal_plans: MealPlanOption[];
}

export default function RateCreate({ hotels, room_types, meal_plans }: RateCreateProps) {
    const { data, setData, post, processing, errors } = useForm({
        hotel_id: '',
        room_type_id: '',
        meal_plan_id: '',
        cost_price: '',
        sale_price: '',
        currency: 'EUR',
        stock: '0',
        cancellation_policy: 'FREE_CANCELLATION',
        deposit_amount: '',
        balance_due_days_before_checkin: '',
        cancellation_deadline: '',
        is_active: true,
    });

    const submit = (event: FormEvent) => {
        event.preventDefault();
        post(route('admin.rates.store'));
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Criar Tarifa</h2>}
        >
            <Head title="Criar Tarifa" />

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
                            submitLabel="Criar tarifa"
                        />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
