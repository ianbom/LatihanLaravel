import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { login } from '@/routes';

export default function Register() {
    return (
        <>
            <Head title="Informasi Akun" />

            <Alert>
                <ShieldCheck />
                <AlertTitle>Registrasi mandiri tidak tersedia</AlertTitle>
                <AlertDescription>
                    Akun dashboard dikelola oleh administrator dan menggunakan
                    kredensial dari layanan backend. Hubungi administrator jika
                    Anda memerlukan akses.
                </AlertDescription>
            </Alert>

            <Button asChild className="w-full">
                <Link href={login()}>
                    <ArrowLeft />
                    Kembali ke halaman masuk
                </Link>
            </Button>
        </>
    );
}

Register.layout = {
    title: 'Akses Dashboard',
    description: 'Informasi pembuatan dan pengelolaan akun pengguna.',
};
