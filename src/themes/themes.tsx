
import { createTheme } from '@mui/material/styles';

const themes = createTheme({
    palette: {
      primary: {
        main: '#214F6E', // Cor primária
      },
      secondary: {
        main: '#ff4081', // Cor secundária
      },
      background: {
        default: '#f5f5f5', // Cor de fundo
      },
      text: {
        primary: '#333333', // Cor principal do texto
      },
    },
    typography: {
      fontFamily: 'Poppins, sans-serif'
    },
  });
  


export default themes;
