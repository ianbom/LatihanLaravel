import { Form, Head } from '@inertiajs/react';
import { CircleAlert, Info, LockKeyhole, UserRound } from 'lucide-react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { register } from '@/routes';
import { store } from '@/routes/login';

type Props = {
    status?: string;
};

export default function Login({ status }: Props) {
    return (
        <>
            <Head title="Masuk" />

            {status && (
                <Alert>
                    <Info />
                    <AlertDescription>{status}</AlertDescription>
                </Alert>
            )}

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                disableWhileProcessing
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        {errors.login && (
                            <Alert variant="destructive">
                                <CircleAlert />
                                <AlertDescription>
                                    {errors.login}
                                </AlertDescription>
                            </Alert>
                        )}

                        <div className="grid gap-5">
                            <div className="grid gap-2">
                                <Label htmlFor="username">Username</Label>
                                <div className="relative">
                                    <UserRound className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="username"
                                        type="text"
                                        name="username"
                                        required
                                        autoFocus
                                        autoCapitalize="none"
                                        autoCorrect="off"
                                        autoComplete="username"
                                        placeholder="Masukkan username"
                                        className="pl-9"
                                        aria-invalid={Boolean(errors.username)}
                                    />
                                </div>
                                <InputError message={errors.username} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password">Password</Label>
                                <div className="relative">
                                    <LockKeyhole className="pointer-events-none absolute top-1/2 left-3 z-10 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <PasswordInput
                                        id="password"
                                        name="password"
                                        required
                                        autoComplete="current-password"
                                        placeholder="Masukkan password"
                                        className="pl-9"
                                        aria-invalid={Boolean(errors.password)}
                                    />
                                </div>
                                <InputError message={errors.password} />
                            </div>

                            <Button
                                type="submit"
                                className="mt-1 w-full"
                                disabled={processing}
                                data-test="login-button"
                            >
                                {processing && <Spinner />}
                                {processing
                                    ? 'Memverifikasi...'
                                    : 'Masuk ke Dashboard'}
                            </Button>
                        </div>

                        <p className="text-center text-sm text-muted-foreground">
                            Belum memiliki akses?{' '}
                            <TextLink href={register()}>
                                Informasi akun
                            </TextLink>
                        </p>
                    </>
                )}
            </Form>
        </>
    );
}

Login.layout = {
    title: 'Selamat datang kembali',
    description: 'Masuk menggunakan akun yang diberikan administrator.',
};
