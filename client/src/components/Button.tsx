type TButtonProps = {
  isDisabled?: boolean;
  onClick: () => void;
  text: string;
  color?: string;
}
export default function Button({ isDisabled, onClick, text, color='green'}: TButtonProps) {
  const bgColor = color === 'green' ? 'bg-green-700' : 'bg-red-700';
  return (<button disabled={isDisabled} className={`min-w-52 bg-green-700 rounded p-5 text-2xl ${bgColor}`} onClick={onClick}>
    {text}
  </button>
  );
}