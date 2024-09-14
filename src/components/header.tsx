import Logo from '../assets/LogoBranca.png'
import WaterIcon from '@mui/icons-material/Water';

export default function Header() {
    return (
        <div
            style={{
                width: '100vw',
                height: '27.5vh',
                backgroundColor: '#214F6E',
                margin: '0',
                display: 'flex',
                justifyContent: 'space-around',
                alignItems: 'center',
                borderBottomRightRadius: '3.5rem',
                borderBottomLeftRadius: '3.5rem',
            }}
        >
            <WaterIcon sx={{
                color: '#1ABCC7',
                width: '12rem',
                height: '12rem',
                '@media (max-width: 960px)': {
                    display: 'none'
                }
            }}
            />
            <img src={Logo} alt="logo" style={{ height: '50%', maxWidth: '95%' }} />
            <WaterIcon sx={{
                color: '#1ABCC7',
                width: '12rem',
                height: '12rem',
                '@media (max-width: 960px)': {
                    display: 'none'
                }
            }}
            />
        </div>
    );
}
