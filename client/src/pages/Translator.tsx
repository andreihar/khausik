import { Container, Text, TextInput, Switch, Button, Flex, Box, Grid, Select, Checkbox, ActionIcon, Modal, Radio, Group, rem } from '@mantine/core';
import Textarea from '../components/Textarea';
import classes from '../styles/common.module.css';
import { useTranslation } from 'react-i18next';
import { useEffect, useState, useRef } from 'react';
import { Converter, Tokeniser, toTraditional, toSimplified } from 'taibun';
import { useClipboard, useDisclosure } from '@mantine/hooks';
import { IconCopy, IconCheck, IconVolume, IconX, IconSquare, IconLanguageKatakana } from '@tabler/icons-react';
import { getTranslation } from '../services/TranslateService';

export default function Translator() {
  const [system, setSystem] = useState<'Tailo' | 'POJ' | 'Zhuyin' | 'TLPA' | 'Pingyim' | 'Tongiong' | 'IPA'>('Tailo');
  const [dialect, setDialect] = useState<'south' | 'north'>('south');
  const [format, setFormat] = useState<'mark' | 'number' | 'strip'>('mark');
  const [delimiter, setDelimiter] = useState<string>('');
  const [useCustomDelimiter, setUseCustomDelimiter] = useState<boolean>(false);
  const [sandhi, setSandhi] = useState<'auto' | 'none' | 'excLast' | 'inclLast' | 'default'>('default');
  const [punctuation, setPunctuation] = useState<'format' | 'none'>('format');
  const [convertNonCjk, setConvertNonCjk] = useState<boolean>(false);
  const [transBottom, setTransBottom] = useState<boolean>(true);
  const [status, setStatus] = useState<'idle' | 'loading' | 'playing'>('idle');
  const [loading, setLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [inputValue, setInputValue] = useState('');
  const [translateValue, setTranslateValue] = useState('');
  const [transValue, setTransValue] = useState('');

  const [fromLanguage, setFromLanguage] = useState('en');
  const [toLanguage, setToLanguage] = useState('tw');
  const fromLanguages = ["af", "sq", "am", "ar", "hy", "as", "ay", "az", "bm", "eu", "be", "bn", "bho", "bs", "bg", "ca", "ceb", "zh-TW", "zh-CN", "co", "hr", "cs", "da", "dv", "doi", "nl", "en", "eo", "et", "ee", "fi", "fr", "fy", "gl", "ka", "de", "el", "gn", "gu", "ht", "ha", "haw", "he", "hi", "hmn", "hu", "is", "ig", "ilo", "id", "ga", "it", "ja", "jv", "kn", "kk", "km", "rw", "gom", "ko", "kri", "ku", "ckb", "ky", "lo", "la", "lv", "ln", "lt", "lg", "lb", "mk", "mai", "mg", "ms", "ml", "mt", "mi", "mr", "mni-Mtei", "lus", "mn", "my", "ne", "no", "ny", "or", "om", "ps", "fa", "pl", "pt", "pa", "qu", "ro", "ru", "sm", "sa", "gd", "nso", "sr", "st", "sn", "sd", "si", "sk", "sl", "so", "es", "su", "sw", "sv", "tl", "tg", "ta", "tt", "te", "th", "ti", "ts", "tr", "tk", "ak", "uk", "ur", "ug", "uz", "vi", "cy", "xh", "yi", "yo", "zu"];

  const [options, setOptions] = useState({ system, dialect, format, punctuation, convertNonCjk });
  const clipboard = useClipboard();
  const [opened, { open, close }] = useDisclosure(false);
  const { t } = useTranslation();
  const cRef = useRef(new Converter(options));
  const token = new Tokeniser();

  const performConversion = () => {
    if (toLanguage === 'tws') {
      setTranslateValue(toSimplified(translateValue));
    } else {
      setTranslateValue(toTraditional(translateValue));
    }
    const chunks = translateValue.split(/([\n\t]+)/);
    const convertedChunks = chunks.map(chunk => {
      if (/[\n\t]/.test(chunk)) {
        return chunk;
      } else if (!transBottom) {
        const words = token.tokenise(chunk);
        return words.map(word => {
          const converted = cRef.current.get(word);
          if (converted === word) {
            return `<span style="display: inline-block; margin: 0px 2px 0px 2px;">${word}</span>`;
          } else {
            return `<span style="display: inline-block; margin: 0px 2px 0px 2px;"><ruby>${word}<rt>${converted}</rt></ruby></span>`;
          }
        }).join('');
      } else {
        return cRef.current.get(chunk);
      }
    });
    setTransValue(convertedChunks.join(''));
  };

  useEffect(() => {
    const options: any = { system, dialect, format, punctuation: transBottom ? punctuation : 'none', convertNonCjk };

    if (useCustomDelimiter) {
      options.delimiter = delimiter;
    }

    if (sandhi !== 'default') {
      options.sandhi = sandhi;
    }

    setOptions(options);
    cRef.current = new Converter(options);
    performConversion();
  }, [system, dialect, format, delimiter, useCustomDelimiter, sandhi, punctuation, convertNonCjk, transBottom, translateValue, toLanguage]);

  const playAudio = async () => {
    setStatus('loading');
    const c = new Converter({ dialect, format: 'number' });
    const src = encodeURI("https://hapsing.ithuan.tw/bangtsam?taibun=") + encodeURIComponent(c.get(translateValue).toLowerCase());
    audioRef.current = new Audio(src);
    audioRef.current.oncanplaythrough = () => setStatus('playing');
    audioRef.current.onended = () => setStatus('idle');
    audioRef.current.onerror = () => setStatus('idle');
    audioRef.current.play();
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setStatus('idle');
    }
  };

  const handleTranslate = () => {
    setLoading(true);
    getTranslation(fromLanguage, inputValue)
      .then(translatedValue => {
        setTranslateValue(toTraditional(translatedValue));
        setLoading(false);
      })
      .catch(error => {
        console.error("Error translating input", error);
        setLoading(false);
      });
  };

  return (
    <>
      <Modal zIndex={1001} opened={opened} onClose={close} centered>
        <Container>
          <Select mt="lg" size="md" label={t('translator.system.label')} allowDeselect={false} data={[
            { value: 'Tailo', label: t('translator.system.tailo') },
            { value: 'POJ', label: t('translator.system.poj') },
            { value: 'Zhuyin', label: t('translator.system.zhuyin') },
            { value: 'TLPA', label: t('translator.system.tlpa') },
            { value: 'Pingyim', label: t('translator.system.pingyim') },
            { value: 'Tongiong', label: t('translator.system.tongiong') },
            { value: 'IPA', label: t('translator.system.ipa') },
          ]} comboboxProps={{ zIndex: 1002 }} value={system} onChange={(value) => setSystem(value as any)} />
          <Select mt="lg" size="md" label={t('translator.dialect.label')} allowDeselect={false} data={[
            { value: 'south', label: t('translator.dialect.south') },
            { value: 'north', label: t('translator.dialect.north') },
          ]} comboboxProps={{ zIndex: 1002 }} value={dialect} onChange={(value) => setDialect(value as any)} />
          <Select mt="lg" size="md" label={t('translator.format.label')} allowDeselect={false} data={[
            { value: 'mark', label: t('translator.format.mark') },
            { value: 'number', label: t('translator.format.number') },
            { value: 'strip', label: t('translator.format.strip') },
          ]} comboboxProps={{ zIndex: 1002 }} value={format} onChange={(value) => setFormat(value as any)} />
          <Box mt="lg">
            <Text size="md" fw={500} >{t('translator.delimiter')}</Text>
            <Flex align="center" style={{ width: '100%' }}>
              <Checkbox checked={useCustomDelimiter} size="md" style={{ flexShrink: 0 }}
                onChange={event => setUseCustomDelimiter(event.target.checked)}
              />
              <TextInput value={delimiter} size="md" disabled={!useCustomDelimiter}
                onChange={event => setDelimiter(event.target.value)}
                style={{ marginLeft: '10px', flexGrow: 1 }}
              />
            </Flex>
          </Box>
          <Select mt="lg" size="md" label={t('translator.sandhi.label')} allowDeselect={false} data={[
            { value: 'default', label: t('translator.sandhi.default') },
            { value: 'auto', label: t('translator.sandhi.auto') },
            { value: 'none', label: t('translator.sandhi.none') },
            { value: 'excLast', label: t('translator.sandhi.excLast') },
            { value: 'inclLast', label: t('translator.sandhi.inclLast') },
          ]} comboboxProps={{ zIndex: 1002 }} value={sandhi} onChange={(value) => setSandhi(value as any)} />
          <Select mt="lg" size="md" label={t('translator.punctuation.label')} allowDeselect={false} data={[
            { value: 'format', label: t('translator.punctuation.format') },
            { value: 'none', label: t('translator.punctuation.none') },
          ]} comboboxProps={{ zIndex: 1002 }} value={punctuation} onChange={(value) => setPunctuation(value as any)} />
          <Flex justify="center">
            <Switch size="lg" onLabel="ON" offLabel="OFF" label={t('translator.convertNonCjk')} mt="md" fw={500} checked={convertNonCjk} onChange={event => setConvertNonCjk(event.target.checked)} />
          </Flex>
          <Flex justify="center">
            <Radio.Group mt="lg" size="md" label={t('translator.transliteration.label')} value={transBottom.toString()}
              onChange={value => setTransBottom(value === 'true')}
            >
              <Group mt="xs" justify='center'>
                <Radio value="true" label={t('translator.transliteration.bottom')} />
                <Radio value="false" label={t('translator.transliteration.ruby')} />
              </Group>
            </Radio.Group>
          </Flex>
        </Container>
      </Modal>
      <Box pos='relative' className={classes.wrapper}>
        <Container size={1200} my='lg' pos="relative">
          <Grid gutter="md" grow={false}>
            <Grid.Col span={{ xs: 12, sm: 12, md: 6, lg: 6, xl: 6 }}>
              <Select mt="lg" size="md" allowDeselect={false} data={fromLanguages
                .map(lang => ({ value: lang, label: t(`languages.${lang}`) }))
                .sort((a, b) => a.label.localeCompare(b.label))}
                value={fromLanguage} onChange={(value) => setFromLanguage(value as any)} searchable />
              <Textarea value={inputValue} placeholder={t('translator.enter')} onChange={event => setInputValue(event.target.value)}
                topRight={
                  <ActionIcon variant="light" radius="xl" size="xl"
                    onClick={() => setInputValue('')}>
                    <IconX style={{ width: rem(20) }} />
                  </ActionIcon>}
                bottomRight={<Text py="xs" pe="xs" c="dimmed">{t('translator.keyWithCount', { count: inputValue.length })}</Text>}
              />
            </Grid.Col>
            <Grid.Col span={{ xs: 12, sm: 12, md: 6, lg: 6, xl: 6 }}>
              <Select mt="lg" size="md" allowDeselect={false} data={[
                { value: 'tw', label: t('languages.tw') },
                { value: 'tws', label: t('languages.tws') }
              ]} value={toLanguage} onChange={(value) => setToLanguage(value as any)} />
              <Textarea readOnly placeholder={t('translator.output')} value={transBottom ? translateValue : transValue}
                bottomLeft={
                  <ActionIcon loading={status === 'loading'} variant="light" radius="xl" size="xl"
                    onClick={status === 'playing' ? stopAudio : playAudio}>
                    {status === 'playing' ? <IconSquare style={{ width: rem(20) }} /> : <IconVolume style={{ width: rem(22) }} />}
                  </ActionIcon>}
                bottomRight={
                  <ActionIcon variant="light" radius="xl" size="xl"
                    onClick={() => clipboard.copy(transValue)}>
                    {clipboard.copied ? (<IconCheck style={{ width: rem(20) }} />
                    ) : (<IconCopy style={{ width: rem(20) }} />)}
                  </ActionIcon>}
                bottomCentre={
                  transBottom ? (
                    <Text py="xs" pe="xs" c="dimmed" style={{ wordWrap: 'break-word' }}>
                      {transValue}
                    </Text>
                  ) : null
                }
                topRight={
                  <ActionIcon variant="light" radius="xl" size="xl" onClick={open}>
                    <IconLanguageKatakana />
                  </ActionIcon>}
              />
            </Grid.Col>
            <Flex mt='lg' justify="center">
              <Button radius="xl" size="md" styles={{ root: { height: rem(48), backgroundImage: 'linear-gradient(to right, var(--mantine-color-red-filled), var(--mantine-color-orange-filled))' } }}
                onClick={handleTranslate} loading={loading}>{t('translator.translate')}</Button>
            </Flex>
          </Grid>
        </Container>
      </Box>
    </>
  );
}