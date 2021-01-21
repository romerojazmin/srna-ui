import React, { useState } from 'react';
import PropTypes from 'prop-types';
import MuiButton from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import clsx from 'clsx';
import Box from '@material-ui/core/Box';
import { makeStyles } from '@material-ui/core/styles';
import { useMountedState } from '../../hooks';

export const useStyles = makeStyles(() => ({
    inline: {
        display: 'flex',
        alignItems: 'center',
    },
}));

function Button(props) {
    const classes = useStyles();
    const [loading, setLoading] = useState(false);
    const { className, children, onClick, disabled, inline, variant } = props;
    const isMounted = useMountedState();
    const propsToSpread = { ...props };
    delete propsToSpread.className;
    delete propsToSpread.disabled;
    delete propsToSpread.onClick;
    delete propsToSpread.inline;
    delete propsToSpread.variant;
    return (
        <Box
            className={clsx({ [classes.inline]: inline })}
            display='inline'
        >
            <MuiButton
                className={className}
                disabled={loading || disabled}
                onClick={
                    typeof onClick === 'function'
                        ? async () => {
                            setLoading(true);
                            try {
                                await onClick();
                            } catch (err) {} finally {
                                if (isMounted()) {
                                    setLoading(false);
                                }
                            }
                        }
                        : undefined
                }
                variant={!inline ? (variant || 'contained') : undefined}
                {...propsToSpread}
            >
                {!loading && !inline && children}
                {inline && children}
                {!inline && loading && (
                    <CircularProgress
                        data-testid='button-default-spinner'
                        size={25}
                    />
                )}
            </MuiButton>
            {loading && inline && (
                <CircularProgress
                    data-testid='button-inline-spinner'
                    size={35}
                />
            )}
        </Box>
    );
}

Button.propTypes = {
    children: PropTypes.node.isRequired,
    className: PropTypes.string,
    disabled: PropTypes.bool,
    onClick: PropTypes.func,
    inline: PropTypes.bool,
    variant: PropTypes.string,
};

Button.defaultProps = {
    onClick: undefined,
    disabled: undefined,
    className: '',
    inline: false,
    variant: undefined,
};

export default Button;
