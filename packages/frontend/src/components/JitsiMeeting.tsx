import React, { useEffect, useRef } from 'react';

interface JitsiMeetingProps {
  roomName: string;
  displayName?: string;
  onMeetingEnd?: () => void;
  onParticipantJoined?: (participant: any) => void;
  onParticipantLeft?: (participant: any) => void;
}

declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

export const JitsiMeeting: React.FC<JitsiMeetingProps> = ({
  roomName,
  displayName = 'Anonymous',
  onMeetingEnd,
  onParticipantJoined,
  onParticipantLeft,
}) => {
  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const jitsiApiRef = useRef<any>(null);

  useEffect(() => {
    // Cargar el script de Jitsi si no está cargado
    if (!window.JitsiMeetExternalAPI) {
      const script = document.createElement('script');
      script.src = 'https://meet.jit.si/external_api.js';
      script.async = true;
      script.onload = () => initializeJitsi();
      document.body.appendChild(script);
    } else {
      initializeJitsi();
    }

    return () => {
      // Limpiar al desmontar
      if (jitsiApiRef.current) {
        jitsiApiRef.current.dispose();
        jitsiApiRef.current = null;
      }
    };
  }, [roomName]);

  const initializeJitsi = () => {
    if (!jitsiContainerRef.current || !window.JitsiMeetExternalAPI) return;

    const domain = 'meet.jit.si';
    const options = {
      roomName: roomName,
      width: '100%',
      height: '100%',
      parentNode: jitsiContainerRef.current,
      configOverwrite: {
        prejoinPageEnabled: false,
        startWithAudioMuted: false,
        startWithVideoMuted: false,
        enableWelcomePage: false,
        enableClosePage: false,
        disableDeepLinking: true,
        disableInviteFunctions: true,
        toolbarButtons: [
          'microphone',
          'camera',
          'closedcaptions',
          'desktop',
          'fullscreen',
          'hangup',
          'chat',
          'settings',
          'videoquality',
        ],
      },
      interfaceConfigOverwrite: {
        SHOW_JITSI_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
        SHOW_BRAND_WATERMARK: false,
        SHOW_POWERED_BY: false,
        APP_NAME: 'Random Video Chat',
        MOBILE_APP_PROMO: false,
        HIDE_INVITE_MORE_HEADER: true,
      },
      userInfo: {
        displayName: displayName,
      },
    };

    try {
      jitsiApiRef.current = new window.JitsiMeetExternalAPI(domain, options);

      // Event listeners
      jitsiApiRef.current.addEventListener('videoConferenceJoined', (event: any) => {
        console.log('Joined conference:', event);
      });

      jitsiApiRef.current.addEventListener('videoConferenceLeft', () => {
        console.log('Left conference');
        onMeetingEnd?.();
      });

      jitsiApiRef.current.addEventListener('participantJoined', (event: any) => {
        console.log('Participant joined:', event);
        onParticipantJoined?.(event);
      });

      jitsiApiRef.current.addEventListener('participantLeft', (event: any) => {
        console.log('Participant left:', event);
        onParticipantLeft?.(event);
      });

      jitsiApiRef.current.addEventListener('readyToClose', () => {
        console.log('Ready to close');
        onMeetingEnd?.();
      });
    } catch (error) {
      console.error('Error initializing Jitsi:', error);
    }
  };

  return (
    <div className="w-full h-full relative">
      <div ref={jitsiContainerRef} className="w-full h-full" />
    </div>
  );
};

export default JitsiMeeting;
