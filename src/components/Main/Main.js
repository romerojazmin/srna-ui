import React from 'react';
import clsx from 'clsx';
import { Switch } from 'react-router-dom';
import {
    AppBar,
    Toolbar,
    Box,
    Typography,
    Link,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import {
    Brightness2 as LightModeIcon,
    Flare as DarkModeIcon,
    LockOpen as ClearSessionIcon,
} from '@material-ui/icons';
import { useTranslation } from 'react-i18next';
import jwt from 'jsonwebtoken';
import Logo from '../Logo';
import {
    useWindowSize,
    useService,
    useActions,
    useStore,
    useMount,
} from '../../hooks';
import { routes } from '../../config';
import UserMenu from './UserMenu';

export const useStyles = makeStyles(theme => ({
    toolbar: {
        paddingLeft: 0,
        paddingRight: 0,
    },
    appBar: {
        marginLeft: theme.spacing(2),
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        // Todo need to use appBar height from theme
        height: 64,
        alignItems: 'center',
    },
    content: {
        transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        // TODO need to use appBar height from themes.
        paddingTop: 64,
    },
}));

function Main() {
    const classes = useStyles();
    const dimensions = useWindowSize();
    const [historyService, interceptorService, routesAssemblerService] = useService('history', 'interceptor', 'routesAssembler');
    const userSessionActions = useActions('userSession');
    const theme = useStore('theme');
    const userSession = useStore('userSession');
    const themeActions = useActions('theme');
    const isDark = theme.palette.type === 'dark';
    const [t] = useTranslation('common');
    const storage = useService('storage');

    const switchThemeMode = () => themeActions.setMode(!isDark ? 'dark' : 'light');

    const createSessionId = React.useCallback(() => {
        const sessionId = storage.getSessionId();
        if (sessionId) {
            userSessionActions.login(sessionId);
        } else {
            const sessionId = jwt.sign({ createdDate: new Date().toISOString() }, 'srna');
            userSessionActions.register(sessionId);
        }
    }, [storage, userSessionActions]);

    const clearSession = () => {
        userSessionActions.clearSession();
        if (historyService.getUrl() !== '/') {
            historyService.go('/');
            historyService.reload();
        } else {
            historyService.reload();
        }
    };

    const createInterceptors = React.useCallback(() => {
        interceptorService.registerDataTransformInterceptor();
        interceptorService.registerUnhandledInterceptor(() => console.error('Server failed to send back a response or has crashed.'));
        if (userSession.sessionId) {
            interceptorService.registerRequestInterceptor(request => (request.headers.Authorization = `Bearer ${userSession.sessionId}`));
        }
    }, [interceptorService, userSession.sessionId]);

    useMount(() => {
        createSessionId();
        createInterceptors();
    });

    return (
        <>
            <AppBar position='fixed'>
                <Toolbar className={classes.toolbar}>
                    <Logo />
                    <Box className={classes.appBar}>
                        <Typography
                            className={
                                clsx(
                                    { [classes.hide]: dimensions.width < 690 },
                                )
                            }
                            variant='h5'
                        >
                            <Link
                                color='inherit'
                                href='/'
                                style={{ textDecoration: 'none' }}
                            >
                                {t('appBar.title')}
                            </Link>
                        </Typography>
                        <UserMenu
                            displayName={t('appBar.settings')}
                            dropdowns={[
                                {
                                    title: t('appBar.clearSession'),
                                    Icon: <ClearSessionIcon />,
                                    handler: clearSession,
                                },
                                {
                                    title: `${!isDark ? t('appBar.dark') : t('appBar.light')} ${t('appBar.theme')}`,
                                    Icon: !isDark ? <LightModeIcon /> : <DarkModeIcon />,
                                    handler: switchThemeMode,
                                },
                            ]}
                        />
                    </Box>
                </Toolbar>
            </AppBar>
            <main className={classes.content}>
                <Switch>{routesAssemblerService.assemble(routes)}</Switch>
            </main>
        </>
    );
}

export default Main;
