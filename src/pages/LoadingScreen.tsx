import React, { useEffect, useState } from 'react';

const LoadingScreen: React.FC = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      // Incrementa el progreso, asegurándose de no pasar de 100
      setProgress((prev) => {
        const nextProgress = prev + 10; // O ajusta el incremento como necesites
        return nextProgress >= 100 ? 100 : nextProgress;
      });
    }, 300); // Ajusta el intervalo si quieres que cargue más rápido o lento

    // Limpia el intervalo cuando el componente se desmonta o el progreso llega a 100
    // Opcional: detener cuando llega a 100 si no se desmonta automáticamente
    if (progress >= 100) {
        clearInterval(interval);
    }

    return () => clearInterval(interval); // Limpieza esencial al desmontar
  }, [progress]); // Vuelve a ejecutar el efecto si progress cambia (para detener al 100%)

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-gray-100">
      {/* Imagen de fondo */}
      <img
        src="/assets/images/cows.png" // Asegúrate que la ruta es correcta
        alt="Fondo vacas"
        className="absolute top-0 left-0 w-full h-full object-cover opacity-80 z-0" // Opacidad ajustada un poco
      />

      {/* Contenido centrado */}
      <div className="relative z-10 flex flex-col justify-center items-center h-full">
          {/* Caja de contenido con fondo semi-transparente */}
          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-xl w-[90%] max-w-md text-center shadow-lg">
            <h1
              className="text-4xl font-bold mb-6 text-[#8B4513] drop-shadow-md"
              style={{ fontFamily: 'RioGrande, sans-serif' }} // Asegúrate que la fuente está cargada
            >
              INV BONITO VIENTO
            </h1>

            {/* Barra de carga */}
            <div className="w-full h-5 bg-gray-300 rounded-full overflow-hidden relative border border-gray-400">
               {/* Barra verde de progreso */}
              <div
                className="absolute top-0 left-0 h-full bg-green-600 rounded-full transition-all duration-300 ease-linear" // Transición suave
                style={{ width: `${progress}%` }}
              ></div>
              {/* Texto del porcentaje centrado ENCIMA de la barra */}
              <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white mix-blend-difference">
                 {/* Usamos mix-blend-difference para que el texto cambie de color y sea visible sobre verde y gris */}
                {progress}%
              </span>
            </div>
            <p className="mt-3 text-sm text-gray-700">YA CASI PARCERO...</p>
          </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
