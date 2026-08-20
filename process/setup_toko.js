import { supabase } from '../config/koneksi.js';

document.getElementById('setup-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = document.getElementById('submit-btn');
    const btnText = document.getElementById('btn-text');
    const btnIcon = document.getElementById('btn-icon');

    // UI Loading State
    submitBtn.disabled = true;
    btnIcon.className = "fa-solid fa-circle-notch fa-spin text-xs";
    btnText.textContent = "Menyimpan Konfigurasi...";

    try {
        // 1. Dapatkan user session dari LocalStorage atau Supabase Session Active
        const userSession = JSON.parse(localStorage.getItem('user_session'));
        
        let penggunaId = userSession?.id;

        // Fallback jika session di LocalStorage belum ada, ambil dari Auth Supabase
        if (!penggunaId) {
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            if (authError || !user) {
                alert("Sesi Anda telah berakhir, silakan login kembali.");
                window.location.href = 'login.html';
                return;
            }

            // Ambil ID dari tabel users
            const { data: userData } = await supabase
                .from('users')
                .select('id')
                .eq('email', user.email)
                .single();
            
            penggunaId = userData?.id;
        }

        if (!penggunaId) throw new Error("ID Pengguna tidak ditemukan.");

        // 2. Ambil Input Formulir
        const namaToko = document.getElementById('nama_toko').value;
        const teleponToko = document.getElementById('telepon_toko').value;
        const alamatToko = document.getElementById('alamat_toko').value;
        const jamBuka = document.getElementById('jam_buka').value;
        const jamTutup = document.getElementById('jam_tutup').value;

        const namaAkun = document.getElementById('nama_akun').value;
        const jenisPembayaran = document.getElementById('jenis_pembayaran').value;
        const saldoAwal = parseFloat(document.getElementById('saldo_awal').value) || 0;

        // 3. Insert ke Tabel `toko`
        const { data: tokoData, error: tokoError } = await supabase
            .from('toko')
            .insert([
                {
                    pengguna_id: penggunaId,
                    nama_toko: namaToko,
                    tipe: 'utama',
                    status_operasional: 'aktif',
                    alamat: alamatToko,
                    jam_buka: jamBuka,
                    jam_tutup: jamTutup,
                    telepon: teleponToko
                }
            ])
            .select()
            .single();

        if (tokoError) throw tokoError;

        const newTokoId = tokoData.id;

        // 4. Update relasi `toko_id` di tabel `users`
        const { error: updateUserError } = await supabase
            .from('users')
            .update({ toko_id: newTokoId })
            .eq('id', penggunaId);

        if (updateUserError) throw updateUserError;

        // 5. Insert ke Tabel `akun_pembayaran`
        const { error: akunError } = await supabase
            .from('akun_pembayaran')
            .insert([
                {
                    toko_id: newTokoId,
                    nama_akun: namaAkun,
                    jenis: jenisPembayaran,
                    saldo: saldoAwal,
                    utama: 'iya' // Menjadi akun kas utama toko
                }
            ]);

        if (akunError) throw akunError;

        // Update LocalStorage User Session
        if (userSession) {
            userSession.toko_id = newTokoId;
            localStorage.setItem('user_session', JSON.stringify(userSession));
        }

        alert('Toko berhasil dikonfigurasi! Selamat datang di RINFIS.');
        // Redirect ke dashboard owner
        window.location.href = '../halaman-owner/dashboard.html';

    } catch (err) {
        alert('Gagal setup toko: ' + err.message);
    } finally {
        submitBtn.disabled = false;
        btnIcon.className = "fa-solid fa-arrow-right text-xs";
        btnText.textContent = "Simpan & Buka Dashboard";
    }
});