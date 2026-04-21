import css from './ErrorMessage.module.css'

const ErrorMessage = () => {
  return (
    <>
        <div className={css.circleBorder}>
        </div>
        <div className={css.circle}>
            <div className={css.error}>
            </div>
        </div>
    </>
  )
}

export default ErrorMessage