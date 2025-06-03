export function formatDeadline(date: Date, type?: 'longDate' | 'shortDate' | 'shortDatetime') {

    if (!date.getFullYear) {
        return '';
    }
    const day = type === 'longDate'
        ? date.toLocaleDateString(undefined, {
            weekday: 'short', // e.g., "Sun"
            month: 'short',   // e.g., "Jun"
            day: 'numeric',    // e.g., "1"
            year: 'numeric'   // e.g., "2023"
        })
        : date.getFullYear() === new Date().getFullYear()
            ? date.toLocaleDateString(undefined, {
                weekday: 'short', // e.g., "Sun"
                month: 'short',   // e.g., "Jun"
                day: 'numeric'    // e.g., "1"
            })
            : date.toLocaleDateString(undefined, {
                day: 'numeric',   // e.g., "1"
                month: 'short',   // e.g., "Jun"
                year: 'numeric'   // e.g., "2023"
            });

    if (type === 'longDate' || type === 'shortDate') return day;

    const hours = date.getHours();
    const minutes = date.getMinutes();
    const time = date.toLocaleTimeString(undefined, {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });

    return `${day}${(hours === 0 && minutes === 0) ? '' : `  |  ${time}`}`;
}