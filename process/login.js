// Impor koneksi.js dari folder config
import { supabase } from '../config/koneksi.js';

document.getElementById('auth-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const fullname = document.getElementById('fullname')?.value || '';
    const phone = document.getElementById('phone')?.value || '';

    const btnText = document.getElementById('btn-text');
    const btnIcon = document.getElementById('btn-icon');
    const submitBtn = document.getElementById('submit-btn');

    // UI Loading State
    submitBtn.disabled = true;
    btnIcon.className = "fa-solid fa-circle-notch fa-spin text-xs";

    try {
        if (typeof currentMode !== 'undefined' && currentMode === 'register') {
            btnText.textContent = "Mendaftarkan...";

            // 1. Registrasi via Supabase Auth (Trigger DB otomatis mengisi tabel `users`)
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        full_name: fullname,
                        phone: phone
                    }
                }
            });

            if (authError) throw authError;

            // 2. Simpan session awal untuk frontend
            const tempSession = {
                id: authData.user?.id,
                nama: fullname,
                email: email,
                no_telepon: phone,
                role: 'owner',
                paket: 'free',
                toko_id: null
            };

            localStorage.setItem('user_session', JSON.stringify(tempSession));

            alert('Registrasi berhasil! Silakan selesaikan setup toko Anda.');
            window.location.href = 'setup.html';

        } else {
            btnText.textContent = "Memverifikasi...";

            // Mode Login
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password,
            });

            if (error) throw error;

            // Ambil data user dari database
            const { data: userData } = await supabase
                .from('users')
                .select('*')
                .eq('email', email)
                .maybeSingle();

            const sessionData = userData || {
                id: data.user?.id,
                email: email,
                nama: data.user?.user_metadata?.full_name || 'Owner',
                role: 'owner',
                toko_id: null
            };

            localStorage.setItem('user_session', JSON.stringify(sessionData));

            if (!sessionData.toko_id) {
                window.location.href = 'setup.html';
            } else {
                window.location.href = '../halaman-owner/dashboard.html';
            }
        }
    } catch (err) {
        alert('Gagal: ' + err.message);
    } finally {
        submitBtn.disabled = false;
        btnIcon.className = "fa-solid fa-arrow-right text-xs";
        btnText.textContent = (typeof currentMode !== 'undefined' && currentMode === 'register') ? "Daftar Sekarang" : "Masuk ke Dashboard";
    }
});