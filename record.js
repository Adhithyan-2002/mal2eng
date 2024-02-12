const RecordAudioButton = () => {
    const [recording, setRecording] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
  
   
    const startRecording = async () => {
      try {
        const recording = new Audio.Recording();
        await recording.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
        await recording.startAsync();
        setRecording(recording);
      } catch (error) {
        console.error('Failed to start recording', error);
      }
    };
  
    const stopRecording = async () => {
      if (!recording) return;
  
      try {
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        setRecording(null);
        // Use `uri` to access the recorded audio file.
        console.log('Recording stopped, file URI:', uri);
      } catch (error) {
        console.error('Failed to stop recording', error);
      }
    };
  
    const toggleRecording = () => {
      setIsRecording(prevState => !prevState);
    };
  export default RecordAudioButton ;