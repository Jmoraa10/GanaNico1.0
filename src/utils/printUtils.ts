import jsPDF from 'jspdf';
import autoTable, { UserOptions } from 'jspdf-autotable';

interface PrintOptions {
  movimiento: any;
  fincaNombre: string;
  logoUrl: string;
  empresaNombre?: string;
}

export async function imprimirMovimiento({ movimiento, fincaNombre, logoUrl, empresaNombre = 'INVERSIONES BONITO VIENTO SAS' }: PrintOptions) {
  const doc = new jsPDF();
  const fechaImpresion = new Date().toLocaleString('es-CO');

  // Logo
  let imgData: string | undefined;
  try {
    const response = await fetch(logoUrl);
    const blob = await response.blob();
    const reader = new FileReader();
    imgData = await new Promise<string>((resolve) => {
      reader.onload = function (e) { resolve(e.target?.result as string); };
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    imgData = undefined;
  }

  // Encabezado
  if (imgData) {
    doc.addImage(imgData, 'PNG', 10, 10, 30, 30);
  }
  doc.setFontSize(16);
  doc.text(empresaNombre, 50, 20);
  doc.setFontSize(12);
  doc.text(`Finca: ${fincaNombre}`, 50, 28);
  doc.text(`Fecha impresión: ${fechaImpresion}`, 50, 36);

  let y = 45;

  // Tipo de movimiento
  doc.setFontSize(14);
  doc.text(
    movimiento._tipo === 'bodega'
      ? 'Movimiento de Bodega'
      : movimiento._tipo === 'venta'
      ? 'Venta de Ganado'
      : `Movimiento de Ganado (${movimiento.tipo})`,
    10, y
  );
  y += 8;

  // Datos generales
  doc.setFontSize(11);
  doc.text(`Fecha del movimiento: ${new Date(movimiento.fecha).toLocaleString('es-CO')}`, 10, y);
  y += 6;
  doc.text(`Registrado por: ${movimiento.registradoPor || 'N/A'}`, 10, y);
  y += 6;
  if (movimiento._tipo === 'ganado') {
    doc.text(`Procedencia: ${movimiento.procedencia ?? 'N/A'}`, 10, y);
    y += 6;
    doc.text(`Destino: ${movimiento.destino ?? 'N/A'}`, 10, y);
    y += 6;
  }
  if (movimiento._tipo === 'venta') {
    doc.text(`Comprador: ${movimiento.comprador ?? 'N/A'}`, 10, y);
    y += 6;
    doc.text(`Destino: ${movimiento.destino ?? 'N/A'}`, 10, y);
    y += 6;
    doc.text(`Valor Total: $${movimiento.estadisticas?.valorTotal?.toLocaleString() ?? 'N/A'}`, 10, y);
    y += 6;
  }
  doc.text(`Detalles: ${movimiento.detalles ?? ''}`, 10, y);
  y += 8;

  // Animales o items
  if (movimiento._tipo === 'venta' && movimiento.animales) {
    // --- Datos generales ---
    // Ya se imprimieron: Fecha del movimiento, Registrado por, Comprador, Destino
    // Ahora imprime estadísticas justo después de destino
    if (movimiento.estadisticas) {
      y += 3;
      doc.setFontSize(11);
      doc.text('Estadísticas:', 10, y);
      y += 6;
      Object.entries(movimiento.estadisticas).forEach(([key, value]) => {
        doc.text(`${key}: ${typeof value === 'number' ? value.toLocaleString('es-CO') : value}`, 12, y);
        y += 5;
      });
    }
    // Detalles (si hay)
    if (movimiento.detalles) {
      y += 3;
      doc.setFontSize(11);
      doc.text('Detalles:', 10, y);
      y += 6;
      doc.setFontSize(10);
      doc.text(movimiento.detalles, 14, y, { maxWidth: 180 });
      y += 8;
    }
    // Tabla de Animales Vendidos al final
    y += 8;
    doc.setFontSize(13);
    doc.text('Animales Vendidos', 10, y);
    y += 6;
    autoTable(doc, {
      startY: y,
      head: [['Número', 'Peso (kg)', 'Tipo', 'Sexo']],
      body: movimiento.animales.map((animal: any) => [
        animal.numero || '',
        animal.peso || '',
        animal.tipo || '',
        animal.sexo || ''
      ]),
      margin: { left: 10, right: 10 },
      styles: { fontSize: 10, cellPadding: 2 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      alternateRowStyles: { fillColor: [240, 240, 240] },
    } as UserOptions);
    y = (doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 10 : y + 20;
  } else if (movimiento._tipo === 'ganado' && movimiento.animales) {
    // MACHOS
    doc.setFontSize(13);
    doc.text('Machos', 10, y);
    y += 6;
    autoTable(doc, {
      startY: y,
      head: [['Subgrupo', 'Cantidad']],
      body: [
        ['Levante', movimiento.animales.machos?.levante ?? 0],
        ['Ceba', movimiento.animales.machos?.ceba ?? 0],
      ],
    } as UserOptions);
    y = (doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 4 : y + 20;
    // HEMBRAS
    doc.setFontSize(13);
    doc.text('Hembras', 10, y);
    y += 6;
    autoTable(doc, {
      startY: y,
      head: [['Subgrupo', 'Cantidad']],
      body: [
        ['Levante', movimiento.animales.hembras?.levante ?? 0],
        ['Vientre', movimiento.animales.hembras?.vientre ?? 0],
        ['Preñadas', movimiento.animales.hembras?.preñadas ?? 0],
        ['Escoteras', movimiento.animales.hembras?.escoteras ?? 0],
        ['Paridas (Total)', movimiento.animales.hembras?.paridas?.total ?? 0],
        ['Paridas Machos', movimiento.animales.hembras?.paridas?.machos ?? 0],
        ['Paridas Hembras', movimiento.animales.hembras?.paridas?.hembras ?? 0],
      ],
    } as UserOptions);
    y = (doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 4 : y + 20;
    // BUFALOS
    if (movimiento.animales.bufalos) {
      doc.setFontSize(13);
      doc.text('Búfalos', 10, y);
      y += 6;
      autoTable(doc, {
        startY: y,
        head: [['Subgrupo', 'Cantidad']],
        body: [
          ['Machos Levante', movimiento.animales.bufalos.machos?.levante ?? 0],
          ['Machos Ceba', movimiento.animales.bufalos.machos?.ceba ?? 0],
          ['Hembras Levante', movimiento.animales.bufalos.hembras?.levante ?? 0],
          ['Hembras Vientre', movimiento.animales.bufalos.hembras?.vientre ?? 0],
          ['Hembras Escoteras', movimiento.animales.bufalos.hembras?.escoteras ?? 0],
          ['Paridas (Total)', movimiento.animales.bufalos.hembras?.paridas?.total ?? 0],
          ['Paridas Machos', movimiento.animales.bufalos.hembras?.paridas?.machos ?? 0],
          ['Paridas Hembras', movimiento.animales.bufalos.hembras?.paridas?.hembras ?? 0],
        ],
      } as UserOptions);
      y = (doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 4 : y + 20;
    }
    // EQUINOS
    if (movimiento.animales.equinos) {
      doc.setFontSize(13);
      doc.text('Equinos', 10, y);
      y += 6;
      autoTable(doc, {
        startY: y,
        head: [['Subgrupo', 'Cantidad']],
        body: [
          ['Caballos', movimiento.animales.equinos?.caballos ?? 0],
          ['Yeguas', movimiento.animales.equinos?.yeguas ?? 0],
          ['Potros', movimiento.animales.equinos?.potros ?? 0],
          ['Mulas', movimiento.animales.equinos?.mulas ?? 0],
          ['Yeguas Paridas (Total)', movimiento.animales.equinos?.yeguasParidas?.total ?? 0],
          ['Yeguas Paridas Machos', movimiento.animales.equinos?.yeguasParidas?.machos ?? 0],
          ['Yeguas Paridas Hembras', movimiento.animales.equinos?.yeguasParidas?.hembras ?? 0],
        ],
      } as UserOptions);
      y = (doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 4 : y + 20;
    }
    // OTROS
    if (movimiento.animales.otros) {
      doc.setFontSize(13);
      doc.text('Otros', 10, y);
      y += 6;
      autoTable(doc, {
        startY: y,
        head: [['Subgrupo', 'Cantidad']],
        body: [
          ['Cabras', movimiento.animales.otros?.cabras ?? 0],
          ['Peces', movimiento.animales.otros?.peces ?? 0],
          ['Pollos', movimiento.animales.otros?.pollos ?? 0],
          ['Cabras Paridas (Total)', movimiento.animales.otros?.cabrasParidas?.total ?? 0],
          ['Cabras Paridas Machos', movimiento.animales.otros?.cabrasParidas?.machos ?? 0],
          ['Cabras Paridas Hembras', movimiento.animales.otros?.cabrasParidas?.hembras ?? 0],
        ],
      } as UserOptions);
      y = (doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 4 : y + 20;
    }
    // Detalles adicionales
    if (movimiento.detalles) {
      doc.setFontSize(11);
      doc.text(`Detalles: ${movimiento.detalles}`, 10, y);
      y += 6;
    }
    if (movimiento.estadisticas) {
      doc.setFontSize(11);
      doc.text('Estadísticas:', 10, y);
      y += 6;
      Object.entries(movimiento.estadisticas).forEach(([key, value]) => {
        doc.text(`${key}: ${typeof value === 'number' ? value.toLocaleString('es-CO') : value}`, 12, y);
        y += 5;
      });
    }
  } else if (movimiento._tipo === 'bodega' && movimiento.items) {
    doc.setFontSize(13);
    doc.text('Items de Bodega', 10, y);
    y += 6;
    autoTable(doc, {
      startY: y,
      head: [['Ítem', 'Cantidad', 'Unidad']],
      body: movimiento.items.map((item: any) => [item.nombre, item.cantidad, item.unidad]),
    } as UserOptions);
    y = (doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 4 : y + 20;
    if (movimiento.detalles) {
      doc.setFontSize(11);
      doc.text(`Detalles: ${movimiento.detalles}`, 10, y);
      y += 6;
    }
  }

  // Inventario y ventas generales si aplica
  if (movimiento.estadisticas && movimiento._tipo !== 'venta' && movimiento._tipo !== 'ganado') {
    doc.setFontSize(11);
    doc.text('Estadísticas:', 10, y);
    y += 6;
    Object.entries(movimiento.estadisticas).forEach(([key, value]) => {
      doc.text(`${key}: ${typeof value === 'number' ? value.toLocaleString('es-CO') : value}`, 12, y);
      y += 5;
    });
  }

  // Mostrar el diálogo de impresión en vez de descargar
  doc.autoPrint();
  const string = doc.output('bloburl');
  window.open(string, '_blank');
}

