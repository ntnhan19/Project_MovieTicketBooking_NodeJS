import ItemList from "./ItemList";

const ComboSection = ({ combos, onAddItem }) => {
  return (
    <ItemList
      items={combos}
      loading={false}
      onAddItem={onAddItem}
      isCombo={true}
      emptyMessage="Không có combo nào hiện có"
      emptyButtonText={null}
    />
  );
};

export default ComboSection;