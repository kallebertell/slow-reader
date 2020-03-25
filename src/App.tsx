import React, { useEffect, useState, useCallback, useRef } from 'react';
import styled from "styled-components";

const TIME_TICK = 100;
const CHAR_OFFSET = 500;
const CHAR_DURATION = 500;

const parse = (str: string) => {
  const tokens = [];

  while (str.length > 0) {
    const nextLetter = str.substr(0, 1);
    const nextTwoLetters = str.substr(0, 2);

    if (["th", "ng", "oo", "ou", "ea", "ch", "mm"].includes(nextTwoLetters.toLowerCase())) {
      tokens.push(nextTwoLetters);
      str = str.substr(2)
    } else {
      tokens.push(nextLetter);
      str = str.substr(1);
    }
  }

  return tokens;
}

const story1 = `There once was a big dragon. This dragon liked ice-cream. It was very yummy.`;

const snips = parse(story1).map((s, idx) => ({
  from: CHAR_OFFSET * idx,
  to: CHAR_OFFSET * idx + CHAR_DURATION,
  id: `s${idx}`,
  text: s
}));

const getSnipForTime = (time: number) => snips.find(({ from, to }) => (from <= time) && (time <= to));

const Container = styled.div`
  padding-top: 150px;
  max-width: 600px;
  margin: 0 auto;
`;

const Text = styled.div`
  font-size: 30px;
  letter-spacing: 3px;
`;

const TrackBall = styled.div`
  position: absolute;
  height: 30px;
  width: 30px;
  border-radius: 3px;
  background: rgba(255, 0, 0, 0.2);
  transition: all 50ms ease-in;
  transform: translateY(5px) translateX(-2px);
`;

const SnipEl = styled.span``;

const getAudioPlayerEl = () => document.getElementById("audioPlayer")! as HTMLAudioElement

function App() {
  const [currentTime, setCurrentTime] = useState(0);
  const [ballPosition, setBallPosition] = useState({ top: 0, left: 0 });
  const intervalRef = useRef(0);

  const start = useCallback(() => {
    setCurrentTime(0);
    getAudioPlayerEl().currentTime = 0;
    intervalRef.current = setInterval(() => {
      setCurrentTime(c => c + TIME_TICK)
    }, TIME_TICK);
  }, []);

  const stop = useCallback(() => {
    clearInterval(intervalRef.current);
  }, [])

  useEffect(() => {
    if (currentTime > snips[snips.length-1].to) {
      stop();
    }
  }, [currentTime, stop])

  useEffect(() => {
    const snip = getSnipForTime(currentTime);
    if (!snip) {
      return;
    }

    if (!snip.text.match(/[A-Z]/i)) {
      // Don't highlight white space
      return;
    }

    const snipEl = document.getElementById(snip.id);
    if (!snipEl) {
      return;
    }

    if (snipEl.offsetWidth < 1) {
      // Some whitespace elements get reduced to 0 width.
      // We ignore these
      return;
    }

    const position = {
      top: snipEl.offsetTop,
      left: snipEl.offsetLeft,
      width: snipEl.offsetWidth
    };
    setBallPosition(position);
  }, [currentTime]);

  return (
    <Container>
      <audio
        id="audioPlayer"
        style={{ marginBottom: 20 }}
        onPlay={start}
        onPause={stop}
        controls
        src="/dragon2.m4a">
            Your browser does not support the
            <code>audio</code> element.
      </audio>
      <TrackBall style={ballPosition} />
      <Text>
        {snips.map(({ text, id }) => <SnipEl key={id} id={id}>{text}</SnipEl>)}
      </Text>
      <img src="dragon.jpg" alt="dragon" style={{ paddingTop: 20 }}/>
    </Container>
  );
}

export default App;
