import css from './ReturnBack.module.css'
import { RiArrowGoBackFill } from "react-icons/ri";


const ReturnBack = ({onClick}:{onClick: (() => void) | undefined}) => {
  return (
          <RiArrowGoBackFill size={30} className={css.returnIcon} onClick={onClick} />
  )
}

export default ReturnBack