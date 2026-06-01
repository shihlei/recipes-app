import { Button } from '@/components/ui/button';

interface Props {
  label: string;
  active: boolean;
  onClick: () => void;
}

export default function CategoryChip({ label, active, onClick }: Props) {
  return (
    <li style={{ listStyle: 'none', display: 'inline' }}>
      <Button
        variant={active ? 'default' : 'outline'}
        size="sm"
        className="rounded-full"
        onClick={onClick}
        aria-pressed={active}
      >
        {label}
      </Button>
    </li>
  );
}
