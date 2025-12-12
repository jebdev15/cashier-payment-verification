export const extractAccountItemTitle = (items: any[], allParticulars: any[]) => {
    console.log({  items, allParticulars });
    if (!items || items.length === 0) return "No particulars selected";

    const titles = items.map((itemId) => {
        const particular = allParticulars.find((p) => p.id === itemId);
        return particular ? particular.name : `Unknown Particular (ID: ${itemId})`;
    });

    return titles.join(", ");
}