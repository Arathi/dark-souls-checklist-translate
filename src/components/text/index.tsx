type Props = {
  id: string;
  original: string;
};

export const Text = ({ id, original }: Props) => {
  return (
    <div data-text-id={id}>{original}</div>
  );
}