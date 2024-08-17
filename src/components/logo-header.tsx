import Logo from "../assets/logo.png"

export default function LogoHeader() {

    return (
        <div style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            margin: '2vh 0'
        }}>
            <img src={Logo} style={{ alignSelf: "center" }} />
        </div>
    );
}

