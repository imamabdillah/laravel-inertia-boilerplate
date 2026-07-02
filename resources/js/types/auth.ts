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

export type Mitra = {
    id: number;
    user_id: string;
    nama_lembaga: string;
    jenis_lembaga: string;
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
    status: 'draft' | 'menunggu_verifikasi' | 'diverifikasi' | 'ditolak' | 'aktif' | 'nonaktif';
    catatan_admin: string | null;
    verified_at: string | null;
    logo: string | null;
    is_profile_complete: boolean;
    is_documents_complete: boolean;
    can_submit: boolean;
    dokumens?: DokumenMitra[];
    created_at: string;
    updated_at: string;
};
