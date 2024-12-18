
import { createTheme } from '@mui/material/styles';
import "@fontsource/poppins";

const themes = createTheme({
    palette: {
      primary: {
        main: '#214F6E', // Cor primária
      },
      secondary: {
        main: '#1ABCC7', // Cor secundária
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
