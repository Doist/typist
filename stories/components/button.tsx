import classNames from 'classnames'

import styles from './button.module.css'

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>

function Button({ className, type = 'button', ...props }: ButtonProps) {
    return <button {...props} type={type} className={classNames(styles.button, className)} />
}

export { Button }
