import { Handshake } from 'lucide-react';
import type { SVGAttributes } from 'react';

// Ikon Handshake — representasi visual "kerjasama" (mitra/partnership),
// dipakai di seluruh app (sidebar, header, auth layout) lewat satu komponen.
export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return <Handshake {...props} />;
}
