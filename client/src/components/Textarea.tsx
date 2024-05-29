import React, { useRef, useEffect, useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import classes from '../styles/common.module.css';

interface TextareaProps {
  topRight?: React.ReactNode;
  bottomRight?: React.ReactNode;
  bottomLeft?: React.ReactNode;
  bottomCentre?: React.ReactNode;
  onChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  readOnly?: boolean;
  placeholder?: string;
  value?: string | number | string[];
  cn?: boolean;
}

const Textarea: React.FC<TextareaProps> = ({ topRight, bottomRight, bottomLeft, bottomCentre, onChange, readOnly, placeholder, value, cn }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const topRightRef = useRef<HTMLDivElement>(null);
  const bottomRightRef = useRef<HTMLDivElement>(null);
  const bottomLeftRef = useRef<HTMLDivElement>(null);
  const bottomCentreRef = useRef<HTMLDivElement>(null);

  const [paddingRight, setPaddingRight] = useState('1em');
  const [paddingBottom, setPaddingBottom] = useState('0');

  useEffect(() => {
    if (topRightRef.current) {
      setPaddingRight(`${topRightRef.current.offsetWidth}px`);
    }
    if (bottomRightRef.current || bottomLeftRef.current || bottomCentreRef.current) {
      const bottomRightHeight = bottomRightRef.current ? bottomRightRef.current.offsetHeight : 0;
      const bottomLeftHeight = bottomLeftRef.current ? bottomLeftRef.current.offsetHeight : 0;
      setPaddingBottom(`${Math.max(bottomRightHeight, bottomLeftHeight)}px`);
    }
  }, [topRight, bottomRight, bottomLeft, bottomCentre]);

  return (
    <div className={`${classes.textareaContainer} ${readOnly ? classes.textReadonly : ''}`} style={{ position: 'relative', borderRadius: '0.5rem' }}>
      {topRight && <div ref={topRightRef} style={{ position: 'absolute', top: '0.5em', right: '0.5em' }}>{topRight}</div>}
      {bottomRight && <div ref={bottomRightRef} style={{ position: 'absolute', bottom: '0.5em', right: '0.5em' }}>{bottomRight}</div>}
      {bottomLeft && <div ref={bottomLeftRef} style={{ position: 'absolute', bottom: '0.5em', left: '0.5em' }}>{bottomLeft}</div>}
      {readOnly ? (
        <div
          className={`${classes.textarea} ${cn ? classes.zhCn : ''}`}
          style={{
            width: '100%',
            marginTop: '2px',
            paddingTop: '11px',
            paddingLeft: '20px',
            paddingRight: `calc(${paddingRight} + 5px)`,
            paddingBottom: `calc(${bottomCentre ? '0' : paddingRight} + 5px)`,
            minHeight: bottomCentre ? '18.7rem' : '23.5rem',
            border: 'none',
            borderRadius: '4px',
            outline: 'none',
            resize: 'none',
            overflow: "hidden",
            wordWrap: 'break-word',
            fontSize: '1.25rem',
            color: `var(--mantine-color-text)`,
            backgroundColor: 'transparent',
            whiteSpace: 'pre-wrap',
          }}
          dangerouslySetInnerHTML={{ __html: value || '' }}
        />
      ) : (
        <TextareaAutosize
          className={`${classes.textarea} ${cn ? classes.zhCn : ''}`}
          ref={textareaRef}
          onChange={onChange}
          minRows={bottomCentre ? 9 : 10}
          readOnly={readOnly}
          placeholder={placeholder}
          value={value}
          lang={cn ? 'zh-cn' : 'zh-tw'}
          style={{
            width: '100%',
            marginTop: '2px',
            paddingTop: '11px',
            paddingLeft: '20px',
            paddingRight: `calc(${paddingRight} + 5px)`,
            paddingBottom: `calc(${bottomCentre ? '0' : paddingRight} + 5px)`,
            border: 'none',
            borderRadius: '4px',
            outline: 'none',
            resize: 'none',
            overflow: "hidden",
            fontSize: '1.25rem',
            color: `var(--mantine-color-text)`,
            backgroundColor: 'transparent',
          }}
        />
      )}
      {bottomCentre && <div ref={bottomCentreRef} style={{ paddingTop: '0.5em', paddingBottom: `calc(${paddingBottom} + 5px`, paddingRight: '0.5em', paddingLeft: '0.5em' }}>{bottomCentre}</div>}
    </div>
  );
};

export default Textarea;