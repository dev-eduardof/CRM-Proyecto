from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from datetime import datetime
import os


def generar_pdf_solicitud_vacaciones(solicitud, empleado, aprobador=None):
    """
    Genera un PDF de solicitud de vacaciones
    
    Args:
        solicitud: Objeto SolicitudVacaciones
        empleado: Objeto User (empleado que solicita)
        aprobador: Objeto User (quien aprobó) - opcional
    
    Returns:
        str: Ruta del archivo PDF generado
    """
    # Crear directorio si no existe
    pdf_dir = "uploads/vacaciones"
    os.makedirs(pdf_dir, exist_ok=True)
    
    # Nombre del archivo
    filename = f"solicitud_vacaciones_{solicitud.id}_{empleado.id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
    filepath = os.path.join(pdf_dir, filename)
    
    # Crear documento con márgenes reducidos
    doc = SimpleDocTemplate(
        filepath, 
        pagesize=letter,
        topMargin=0.5*inch,
        bottomMargin=0.5*inch,
        leftMargin=0.75*inch,
        rightMargin=0.75*inch
    )
    story = []
    styles = getSampleStyleSheet()
    
    # Estilos personalizados
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=16,
        textColor=colors.HexColor('#1976d2'),
        spaceAfter=10,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold'
    )
    
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=12,
        textColor=colors.HexColor('#1976d2'),
        spaceAfter=6,
        spaceBefore=6,
        fontName='Helvetica-Bold'
    )
    
    normal_style = ParagraphStyle(
        'CustomNormal',
        parent=styles['Normal'],
        fontSize=10,
        spaceAfter=3
    )
    
    # Título
    story.append(Paragraph("SOLICITUD DE VACACIONES", title_style))
    story.append(Spacer(1, 0.1*inch))
    
    # Información del documento
    fecha_actual = datetime.now().strftime('%d de %B de %Y')
    story.append(Paragraph(f"<b>Fecha de emisión:</b> {fecha_actual}", normal_style))
    story.append(Paragraph(f"<b>Folio:</b> VAC-{solicitud.id:05d}", normal_style))
    story.append(Spacer(1, 0.1*inch))
    
    # Datos del Empleado
    story.append(Paragraph("DATOS DEL EMPLEADO", heading_style))
    
    empleado_data = [
        ['Nombre Completo:', empleado.nombre_completo],
        ['RFC:', empleado.rfc or 'N/A'],
        ['Departamento:', empleado.departamento or 'N/A'],
        ['Puesto:', empleado.puesto_especifico or 'N/A'],
        ['Fecha de Ingreso:', empleado.fecha_ingreso.strftime('%d/%m/%Y') if empleado.fecha_ingreso else 'N/A']
    ]
    
    empleado_table = Table(empleado_data, colWidths=[2*inch, 4*inch])
    empleado_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#e3f2fd')),
        ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor('#1976d2')),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(empleado_table)
    story.append(Spacer(1, 0.1*inch))
    
    # Detalles de la Solicitud
    story.append(Paragraph("DETALLES DE LA SOLICITUD", heading_style))
    
    tipo_labels = {
        'DIAS_COMPLETOS': 'Días Completos',
        'MEDIO_DIA': 'Medio Día',
        'HORAS': 'Horas'
    }
    
    solicitud_data = [
        ['Tipo de Solicitud:', tipo_labels.get(solicitud.tipo.value, solicitud.tipo.value)],
        ['Fecha de Inicio:', solicitud.fecha_inicio.strftime('%d/%m/%Y')],
        ['Fecha de Fin:', solicitud.fecha_fin.strftime('%d/%m/%Y')],
        ['Cantidad:', f"{solicitud.cantidad} {'días' if solicitud.tipo.value == 'DIAS_COMPLETOS' else 'horas'}"],
        ['Fecha de Solicitud:', solicitud.fecha_solicitud.strftime('%d/%m/%Y %H:%M')]
    ]
    
    if solicitud.observaciones:
        solicitud_data.append(['Observaciones:', solicitud.observaciones])
    
    solicitud_table = Table(solicitud_data, colWidths=[2*inch, 4*inch])
    solicitud_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#e8f5e9')),
        ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor('#2e7d32')),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(solicitud_table)
    story.append(Spacer(1, 0.15*inch))
    
    # Estado de aprobación (si aplica)
    if solicitud.estado.value == 'APROBADA' and aprobador and solicitud.fecha_aprobacion:
        aprobacion_text = f"<b>Estado:</b> APROBADA | <b>Fecha de Aprobación:</b> {solicitud.fecha_aprobacion.strftime('%d/%m/%Y %H:%M')}"
        story.append(Paragraph(aprobacion_text, normal_style))
        story.append(Spacer(1, 0.1*inch))
    
    # Firmas
    story.append(Paragraph("FIRMAS", heading_style))
    story.append(Spacer(1, 0.1*inch))
    
    # Obtener nombre del aprobador de forma segura
    nombre_aprobador = "PENDIENTE DE APROBACIÓN"
    if aprobador:
        nombre_aprobador = str(aprobador.nombre_completo).upper()
    
    firmas_data = [
        ['', ''],
        ['_' * 40, '_' * 40],
        [
            str(empleado.nombre_completo).upper(),
            nombre_aprobador
        ],
        ['Empleado Solicitante', 'Autoriza']
    ]
    
    firmas_table = Table(firmas_data, colWidths=[3*inch, 3*inch])
    firmas_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 2), (-1, 2), 'Helvetica-Bold'),
        ('FONTNAME', (0, 3), (-1, 3), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, 1), 9),
        ('FONTSIZE', (0, 2), (-1, 2), 9),
        ('FONTSIZE', (0, 3), (-1, 3), 8),
        ('TOPPADDING', (0, 0), (-1, 0), 8),
        ('BOTTOMPADDING', (0, 1), (-1, 1), 2),
        ('TOPPADDING', (0, 2), (-1, 2), 4),
        ('TOPPADDING', (0, 3), (-1, 3), 2),
    ]))
    story.append(firmas_table)
    
    # Construir PDF
    doc.build(story)
    
    return filepath
