import React from "react";
import {css} from "@emotion/react";

const colour = "#4242f3";

const styles = {
    button: css`
      color: ${colour};
      background: transparent;
      border: solid 1px ${colour};
      border-radius: 4px;
      padding: 10px 12px;
      font-size: 1.5rem;
      font-weight: 900;
      align-self: stretch;
      cursor: pointer;

      &:hover {
        background: #010141;
      }

      &:disabled {
        background: #38383a;
        color: #706f6f;
        border-color: #313030;
        cursor: not-allowed;
      }
    `
}

const Button: React.FC<React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>> = (props) => {
    return <button {...props} css={styles.button} />
}

export default Button;