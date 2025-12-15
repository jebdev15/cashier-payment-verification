export const extractAccountItemTitle = (item: number, allParticulars: any[]) => {
    const foundItem = allParticulars.find(p => p.nature_of_collection_id === item);
    return foundItem ? foundItem.item_title : 'Unknown Item';
}