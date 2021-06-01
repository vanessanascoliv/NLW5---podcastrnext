//onde vai todos os components que se repetem
import '../styles/global.scss';

import { Header } from '../components/Header';
import { Player } from '../components/Player';

import styles from '../styles/app.module.scss';
import { PlayerContextProvider } from '../contexts/PlayerContext';
import { useState } from 'react';

function MyApp({ Component, pageProps }) {
  return (
    <PlayerContextProvider>
      <div className = {styles.appWrapper}>
        <main>
          <Header />
          <Component {...pageProps} />{/*conteudo da nossa página*/}
        </main>
        <Player />
      </div>
    </PlayerContextProvider>
  )
}
export default MyApp
