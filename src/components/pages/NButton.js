const React = require('react')
import cn from 'classnames';
import RTButton from 'react-toolbox/lib/button';
import customTheme from './Button.css';

const Button = ({ className, success, delete, theme, ...others }) => {
  const _className = cn(className, {
    [customTheme.success]: success,
    [customTheme.delete]: delete,
  });
  <RTButton className={_className} theme={theme} {...others}/>
);

export default Button;