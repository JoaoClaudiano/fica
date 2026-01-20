// Leitura de conteúdo
function readAloud(text) {
  if('speechSynthesis' in window){
    const msg = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(msg);
  } else {
    alert('TTS não suportado no seu navegador.');
  }
}