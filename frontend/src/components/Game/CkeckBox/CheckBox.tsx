import css from './CheckBox.module.css';

type CheckBoxProps = {
  checked?: boolean; // Optional boolean
};

const CheckBox = ({ checked = false }: CheckBoxProps) => {
  return (
    <input
      className={`${css['form-control']}`}
      type="checkbox"
      name="checkbox"
      checked={checked}
      disabled
    />
  );
};

export default CheckBox;