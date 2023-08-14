import React, { useEffect } from 'react'

interface GoogleLoginCompleteProps {

}

export const GoogleLoginComplete: React.FC<GoogleLoginCompleteProps> = ({ }) => {
  useEffect(() => {
    window.close();
    // setTimeout(() => {
    // }, 1000);
  }, []);
  return (<div>Thanks for loggin in!</div>);
}