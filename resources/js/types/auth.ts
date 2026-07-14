export type UnitRef = {
    id: number;
    name: string;
};

export type User = {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    is_active?: boolean;
    roles?: string[];
    permissions?: string[];
    direktorat?: UnitRef | null;
    upt?: UnitRef | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
};

export type Auth = {
    user: User;
};

export type Role = {
    name: string;
};

export type AdminUser = {
    id: string;
    name: string;
    email: string;
    is_active: boolean;
    roles: string[];
    direktorat_id?: number | null;
    upt_id?: number | null;
    direktorat?: UnitRef | null;
    upt?: UnitRef | null;
    created_at: string;
};

export type PaginatedData<T> = {
    data: T[];
    links: {
        first: string | null;
        last: string | null;
        prev: string | null;
        next: string | null;
    };
    meta: {
        current_page: number;
        from: number | null;
        last_page: number;
        per_page: number;
        to: number | null;
        total: number;
        links: { url: string | null; label: string; active: boolean }[];
    };
};

/* @chisel-passkeys */
export type Passkey = {
    id: number;
    name: string;
    authenticator: string | null;
    created_at_diff: string;
    last_used_at_diff: string | null;
};
/* @end-chisel-passkeys */

export type TwoFactorSetupData = {
    svg: string;
    url: string;
};

export type TwoFactorSecretKey = {
    secretKey: string;
};

export type DokumenMitra = {
    id: number;
    mitra_id: number;
    jenis_dokumen: string;
    wajib: boolean;
    nama_file: string;
    file_path: string;
    file_url: string;
    file_type: string;
    file_size: number;
    file_size_formatted: string;
    status: 'menunggu' | 'diterima' | 'ditolak';
    catatan: string | null;
    created_at: string;
};

export type Audiensi = {
    id: number;
    mitra_id: number;
    pelaksana: string;
    status: 'ditugaskan' | 'dijadwalkan' | 'selesai';
    jadwal: string | null;
    lokasi: string | null;
    hasil: 'lanjut' | 'ditolak' | null;
    catatan_hasil: string | null;
    assigned_at: string | null;
    assigned_by?: string | null;
    completed_by?: string | null;
    can_execute?: boolean;
    mitra?: {
        id: number;
        nama_lembaga: string;
        pic_nama: string;
        jenjang: string[];
        wilayah: string[];
        upt: string[];
        status: Mitra['status'];
    };
    created_at: string;
};

export type Pembahasan = {
    id: number;
    mitra_id: number;
    audiensi_id: number | null;
    pelaksana: string;
    tahap:
        | 'awal'
        | 'lanjutan'
        | 'rk'
        | 'finalisasi'
        | 'validasi'
        | 'penandatanganan';
    status: 'berjalan' | 'selesai' | 'dibatalkan';
    ruang_lingkup: string | null;
    rencana_kerja: string | null;
    nomor_pks: string | null;
    tanggal_tandatangan: string | null;
    catatan: string | null;
    completed_by?: string | null;
    can_advance?: boolean;
    can_batalkan?: boolean;
    mitra?: {
        id: number;
        nama_lembaga: string;
        pic_nama: string;
        jenjang: string[];
        wilayah: string[];
        upt: string[];
        status: Mitra['status'];
    };
    created_at: string;
};

export type Mitra = {
    id: number;
    user_id: string;
    nama_lembaga: string;
    jenis_lembaga: string;
    jenis_lembaga_lainnya: string | null;
    bidang_kerja: string;
    jenjang: string[];
    wilayah: string[];
    upt: string[];
    deskripsi: string | null;
    alamat: string | null;
    kota: string | null;
    provinsi: string | null;
    kode_pos: string | null;
    website: string | null;
    telepon: string;
    email_lembaga: string;
    pic_nama: string;
    pic_jabatan: string;
    pic_telepon: string;
    pic_email: string;
    nomor_akta: string | null;
    nomor_nib: string | null;
    nomor_npwp: string | null;
    status:
        | 'draft'
        | 'menunggu_verifikasi'
        | 'diverifikasi'
        | 'ditolak'
        | 'aktif'
        | 'nonaktif';
    catatan_admin: string | null;
    verified_at: string | null;
    logo: string | null;
    is_profile_complete: boolean;
    is_documents_complete: boolean;
    is_all_dokumen_verified: boolean;
    can_submit: boolean;
    dokumens?: DokumenMitra[];
    suggested_pelaksana?: string;
    latest_audiensi?: Audiensi | null;
    latest_pembahasan?: Pembahasan | null;
    created_at: string;
    updated_at: string;
};
