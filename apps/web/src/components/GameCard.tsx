import styles from './GameCard.module.css';

interface GameCardProps {
  text: string;
  isBlack?: boolean;
  pickCount?: number;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  selectionOrder?: number;
}

export function GameCard({ text, isBlack, pickCount, selected, disabled, onClick, selectionOrder }: GameCardProps) {
  const cardStyle = isBlack ? styles.blackCard : styles.whiteCard;
  const stateStyle = selected ? styles.selected : disabled ? styles.disabled : '';
  
  return (
    <div 
      className={`${styles.card} ${cardStyle} ${stateStyle}`}
      onClick={!disabled ? onClick : undefined}
      role="button"
      aria-disabled={disabled}
      aria-pressed={selected}
    >
      <div className={styles.content}>
        <p className={styles.text}>{text}</p>
      </div>
      
      {isBlack && pickCount && pickCount > 1 && (
        <div className={styles.footer}>
          <span>Elige {pickCount}</span>
        </div>
      )}
      
      {selected && selectionOrder !== undefined && selectionOrder > 0 && (
        <div className={styles.badge}>{selectionOrder}</div>
      )}
    </div>
  );
}
