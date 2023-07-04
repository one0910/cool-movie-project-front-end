/* eslint-disable no-mixed-operators */
import { createGlobalStyle } from 'styled-components';

interface GlobalStyleType { }

export const MovieLevelColor = {
  "普": "#3ced9c",
  "護": "#2a72dd",
  "輔": "#ffc107",
  "限": "#f00",
}

export const GlobalStyle = createGlobalStyle<GlobalStyleType>`
  body{
    background-color: #fcc;
    }
`;