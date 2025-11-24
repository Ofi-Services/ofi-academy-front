import { Button } from '@/shared/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

// SVG del logo de Microsoft (oficial)
const MicrosoftLogo = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg viewBox="0 0 21 21" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
    <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
    <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
    <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
  </svg>
);

interface MicrosoftButtonProps {
  onClick: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}

// ============================================
// OPCIÓN 1: Estilo Clásico (Oficial Microsoft)
// ============================================
export const MicrosoftButton_Classic = ({ onClick, isLoading, disabled }: MicrosoftButtonProps) => (
  <Button
    type="button"
    variant="outline"
    className="w-full h-11 bg-white hover:bg-gray-50 border-gray-300 text-gray-700 font-medium"
    onClick={onClick}
    disabled={isLoading || disabled}
  >
    {isLoading ? (
      <>
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Conectando...
      </>
    ) : (
      <>
        <MicrosoftLogo />
        <span className="ml-3">Continuar con Microsoft</span>
      </>
    )}
  </Button>
);

// ============================================
// OPCIÓN 2: Estilo Moderno con Shadow
// ============================================
export const MicrosoftButton_Modern = ({ onClick, isLoading, disabled }: MicrosoftButtonProps) => (
  <Button
    type="button"
    className="w-full h-12 bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 shadow-md hover:shadow-lg transition-all duration-200 font-semibold"
    onClick={onClick}
    disabled={isLoading || disabled}
  >
    {isLoading ? (
      <>
        <Loader2 className="mr-2 h-5 w-5 animate-spin text-blue-600" />
        <span className="text-gray-700">Conectando con Microsoft...</span>
      </>
    ) : (
      <>
        <MicrosoftLogo className="w-6 h-6" />
        <span className="ml-3">Iniciar sesión con Microsoft</span>
      </>
    )}
  </Button>
);

// ============================================
// OPCIÓN 3: Estilo Minimal Elegante
// ============================================
export const MicrosoftButton_Minimal = ({ onClick, isLoading, disabled }: MicrosoftButtonProps) => (
  <button
    type="button"
    className="w-full h-11 flex items-center justify-center gap-3 px-6 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg text-gray-700 font-medium transition-all hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
    onClick={onClick}
    disabled={isLoading || disabled}
  >
    {isLoading ? (
      <>
        <Loader2 className="h-5 w-5 animate-spin" />
        <span>Autenticando...</span>
      </>
    ) : (
      <>
        <MicrosoftLogo />
        <span>Microsoft</span>
      </>
    )}
  </button>
);

// ============================================
// OPCIÓN 4: Estilo con Fondo Azul Microsoft
// ============================================
export const MicrosoftButton_Blue = ({ onClick, isLoading, disabled }: MicrosoftButtonProps) => (
  <Button
    type="button"
    className="w-full h-12 bg-[#0078d4] hover:bg-[#106ebe] text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200"
    onClick={onClick}
    disabled={isLoading || disabled}
  >
    {isLoading ? (
      <>
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Conectando con Microsoft...
      </>
    ) : (
      <>
        <MicrosoftLogo />
        <span className="ml-3">Continuar con Microsoft</span>
      </>
    )}
  </Button>
);

// ============================================
// OPCIÓN 5: Estilo con Gradiente
// ============================================
export const MicrosoftButton_Gradient = ({ onClick, isLoading, disabled }: MicrosoftButtonProps) => (
  <Button
    type="button"
    className="w-full h-12 bg-gradient-to-r from-[#0078d4] to-[#00a4ef] hover:from-[#106ebe] hover:to-[#0090d9] text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
    onClick={onClick}
    disabled={isLoading || disabled}
  >
    {isLoading ? (
      <>
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Conectando...
      </>
    ) : (
      <>
        <MicrosoftLogo />
        <span className="ml-3">Iniciar con Microsoft</span>
      </>
    )}
  </Button>
);

// ============================================
// OPCIÓN 6: Estilo con Borde y Hover Animado
// ============================================
export const MicrosoftButton_Animated = ({ onClick, isLoading, disabled }: MicrosoftButtonProps) => (
  <button
    type="button"
    className="group relative w-full h-12 flex items-center justify-center gap-3 px-6 bg-white border-2 border-gray-200 rounded-lg text-gray-700 font-semibold overflow-hidden transition-all duration-300 hover:border-[#0078d4] disabled:opacity-50 disabled:cursor-not-allowed"
    onClick={onClick}
    disabled={isLoading || disabled}
  >
    {/* Fondo animado en hover */}
    <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-cyan-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    
    {/* Contenido */}
    <div className="relative flex items-center gap-3">
      {isLoading ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin text-[#0078d4]" />
          <span>Conectando con Microsoft...</span>
        </>
      ) : (
        <>
          <MicrosoftLogo className="w-6 h-6 transition-transform group-hover:scale-110 duration-300" />
          <span className="group-hover:text-[#0078d4] transition-colors">
            Continuar con Microsoft
          </span>
        </>
      )}
    </div>
  </button>
);

// ============================================
// OPCIÓN 7: Estilo Compacto (Para espacios pequeños)
// ============================================
export const MicrosoftButton_Compact = ({ onClick, isLoading, disabled }: MicrosoftButtonProps) => (
  <Button
    type="button"
    variant="outline"
    className="w-full h-10 bg-white hover:bg-gray-50 border-gray-200 text-sm font-medium"
    onClick={onClick}
    disabled={isLoading || disabled}
  >
    {isLoading ? (
      <>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Conectando...
      </>
    ) : (
      <>
        <MicrosoftLogo className="w-4 h-4" />
        <span className="ml-2">Microsoft</span>
      </>
    )}
  </Button>
);

// ============================================
// OPCIÓN 8: Estilo Premium con Glass Effect
// ============================================
export const MicrosoftButton_Glass = ({ onClick, isLoading, disabled }: MicrosoftButtonProps) => (
  <button
    type="button"
    className="w-full h-12 flex items-center justify-center gap-3 px-6 bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-xl text-gray-700 font-semibold shadow-lg hover:shadow-xl hover:bg-white/90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
    onClick={onClick}
    disabled={isLoading || disabled}
  >
    {isLoading ? (
      <>
        <Loader2 className="h-5 w-5 animate-spin text-[#0078d4]" />
        <span>Autenticando...</span>
      </>
    ) : (
      <>
        <MicrosoftLogo className="w-6 h-6" />
        <span>Continuar con Microsoft</span>
      </>
    )}
  </button>
);

// ============================================
// COMPONENTE DEMO: Muestra todas las opciones
// ============================================
export const MicrosoftButtonsShowcase = () => {
  const [loadingButton, setLoadingButton] = useState<number | null>(null);

  const handleClick = (buttonNumber: number) => {
    setLoadingButton(buttonNumber);
    setTimeout(() => setLoadingButton(null), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto p-8 space-y-8 bg-gray-50 min-h-screen">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Botones de Microsoft Auth
        </h1>
        <p className="text-gray-600">
          Elige el estilo que mejor se adapte a tu diseño
        </p>
      </div>

      <div className="space-y-6">
        {/* Opción 1 */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-sm font-semibold text-gray-500 mb-3">
            OPCIÓN 1: Estilo Clásico (Oficial Microsoft)
          </h3>
          <MicrosoftButton_Classic
            onClick={() => handleClick(1)}
            isLoading={loadingButton === 1}
          />
          <p className="text-xs text-gray-500 mt-2">
            ✓ Estilo oficial de Microsoft | ✓ Profesional | ✓ Limpio
          </p>
        </div>

        {/* Opción 2 */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-sm font-semibold text-gray-500 mb-3">
            OPCIÓN 2: Estilo Moderno con Shadow
          </h3>
          <MicrosoftButton_Modern
            onClick={() => handleClick(2)}
            isLoading={loadingButton === 2}
          />
          <p className="text-xs text-gray-500 mt-2">
            ✓ Sombras suaves | ✓ Efecto hover | ✓ Moderno
          </p>
        </div>

        {/* Opción 3 */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-sm font-semibold text-gray-500 mb-3">
            OPCIÓN 3: Estilo Minimal Elegante
          </h3>
          <MicrosoftButton_Minimal
            onClick={() => handleClick(3)}
            isLoading={loadingButton === 3}
          />
          <p className="text-xs text-gray-500 mt-2">
            ✓ Minimalista | ✓ Elegante | ✓ Texto corto
          </p>
        </div>

        {/* Opción 4 */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-sm font-semibold text-gray-500 mb-3">
            OPCIÓN 4: Estilo con Fondo Azul Microsoft
          </h3>
          <MicrosoftButton_Blue
            onClick={() => handleClick(4)}
            isLoading={loadingButton === 4}
          />
          <p className="text-xs text-gray-500 mt-2">
            ✓ Color oficial Microsoft | ✓ Alto contraste | ✓ Call-to-action fuerte
          </p>
        </div>

        {/* Opción 5 */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-sm font-semibold text-gray-500 mb-3">
            OPCIÓN 5: Estilo con Gradiente
          </h3>
          <MicrosoftButton_Gradient
            onClick={() => handleClick(5)}
            isLoading={loadingButton === 5}
          />
          <p className="text-xs text-gray-500 mt-2">
            ✓ Gradiente azul | ✓ Llamativo | ✓ Moderno
          </p>
        </div>

        {/* Opción 6 */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-sm font-semibold text-gray-500 mb-3">
            OPCIÓN 6: Estilo con Borde y Hover Animado
          </h3>
          <MicrosoftButton_Animated
            onClick={() => handleClick(6)}
            isLoading={loadingButton === 6}
          />
          <p className="text-xs text-gray-500 mt-2">
            ✓ Animación en hover | ✓ Interactivo | ✓ Premium
          </p>
        </div>

        {/* Opción 7 */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-sm font-semibold text-gray-500 mb-3">
            OPCIÓN 7: Estilo Compacto
          </h3>
          <MicrosoftButton_Compact
            onClick={() => handleClick(7)}
            isLoading={loadingButton === 7}
          />
          <p className="text-xs text-gray-500 mt-2">
            ✓ Compacto | ✓ Ahorra espacio | ✓ Texto corto
          </p>
        </div>

        {/* Opción 8 */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-sm font-semibold text-gray-500 mb-3">
            OPCIÓN 8: Estilo Premium con Glass Effect
          </h3>
          <MicrosoftButton_Glass
            onClick={() => handleClick(8)}
            isLoading={loadingButton === 8}
          />
          <p className="text-xs text-gray-500 mt-2">
            ✓ Efecto glass | ✓ Backdrop blur | ✓ Premium
          </p>
        </div>
      </div>

      <div className="text-center text-sm text-gray-500 mt-8">
        <p>Haz clic en cualquier botón para ver el estado de loading</p>
      </div>
    </div>
  );
};

export default MicrosoftButtonsShowcase;