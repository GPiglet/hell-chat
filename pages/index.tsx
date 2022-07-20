import * as React from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { SelectFriendContext } from '../contexts/FriendContext';
import { MessageContext, MessageType } from '../contexts/MessageContext';
import {AuthContext} from '../contexts/AuthContext';
import AuthApi from '../services/Auth';

import Head from 'next/head';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import CssBaseline from '@mui/material/CssBaseline';
import Footer from '../components/Footer';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import FriendList from '../components/FriendList';
import ChatContent from '../components/ChatContent';

const LoadingView = () => {
    const [progress, setProgress] = React.useState(0);
    const [opacity, setOpacity] = React.useState(1);

    React.useEffect(() => {
        let counter = 0;
        const timer = setInterval(() => {
          setProgress((prevProgress) => (prevProgress + 1));
          counter += 0.01;
          setOpacity((prevOpacity) => {
            return prevOpacity + (Math.floor(counter)%2 / 50 - 0.01);
          })
        }, 50);
    
        return () => {
          clearInterval(timer);
        };
    }, []);

    return (
        <Box
            sx={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh'
            }}
        >
            <CircularProgress size={100} thickness={1.5} sx={{color: '#ccc'}} variant="determinate" value={progress}/>
            <Typography
                sx={{
                    position: 'absolute',
                    color: '#333',
                    opacity
                }}
            >
                Loading...
            </Typography>
        </Box>
    )
}

const MainView = () => {
    const [selectedFriend, setSelectedFriend] = React.useState(null);
    const selectFriend = (user: any) => {
        setSelectedFriend(user);
    };

    const [messages, setMessages] = React.useState<Array<MessageType>>([]);
    const refChatContent = React.useRef<any>(null);
    const refLeftSide = React.useRef<any>(null);

    const pushMessage = (msg: Array<MessageType>, isReset: boolean) => {
        if ( isReset )
            setMessages(msg);
        else
            setMessages([...messages, ...msg]);
    };

    const onResize = () => {
        if ( window.innerWidth < 600 )
        {
            //xs
            refLeftSide.current.style.display = 'block';
            refChatContent.current.style.display = 'none';
        }
        else
        {
            // sm+
            refLeftSide.current.style.display = 'block';
            refChatContent.current.style.display = 'block';
        }
    }

    React.useEffect(() => {
        window.addEventListener('resize', onResize);
        return ()=>window.removeEventListener('resize', onResize);
    }, []);

    return (
        <SelectFriendContext.Provider value={{user: selectedFriend, selectFriend}} >
        <MessageContext.Provider value={{list: messages, push: pushMessage}} >
            <Head>
                <title>Piggies Chat</title>
                <meta name="description" content="Generated by create next app" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <CssBaseline />
            <Box 
                sx = {{
                    display: 'flex'
                }}
            >
                <Box ref={refLeftSide}
                    sx = {{
                        width: {xs: '100%', sm: 420},
                    }}
                >
                    <Header />
                    <SearchBar />
                    <FriendList refLeftSide={refLeftSide} refChatContent={refChatContent} />
                </Box>
                <ChatContent ref={refChatContent} refLeftSide={refLeftSide}/>
            </Box>
            <Footer />
        </MessageContext.Provider>
        </SelectFriendContext.Provider>
    );
}

const Home: NextPage = () => {
    const router = useRouter();
    const authContext = React.useContext(AuthContext);
    const [showMain, setShowMain] = React.useState<boolean>(false);

    React.useEffect(() => {
        if ( authContext.user ) {
            setShowMain(true);
        }
        else {
            const token = sessionStorage.getItem('app_token') || localStorage.getItem('app_token');
            if ( token ) {
                AuthApi.setToken(token);
                AuthApi.profile(
                    (user: any) => {
                        authContext.setUser(user);
                        setShowMain(true);
                    },
                    (err: any) => {
                        console.log(err)
                        router.push('/login');
                    }
                )
            }
            else {
                router.push('/login');
            }
        }
        
    }, []);

    return (
        <>
        {(showMain == true) ? <MainView /> : <LoadingView />}
        </>
    )
}

export default Home;