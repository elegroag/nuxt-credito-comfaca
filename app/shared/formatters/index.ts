export const formatCurrency = (value: number): string => {
    return value.toLocaleString('es-CO')
}

export const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('es-CO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    })
}
