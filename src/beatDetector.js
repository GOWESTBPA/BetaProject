/**
 * 자동 비트 감지 모듈
 * Web Audio API를 사용해서 오디오 분석 후 노트 패턴 생성
 */

class BeatDetector {
  constructor(options = {}) {
    // 난이도별 설정
    this.threshold = options.threshold || 0.6;  // 감지 임계값 (낮을수록 노트 많음)
    this.minInterval = options.minInterval || 300;  // 최소 노트 간격 (ms)
    this.sampleRate = 44100;
  }

  /**
   * 오디오 파일에서 비트 감지
   * @param {string} audioPath - 오디오 파일 경로
   * @returns {Promise<Array>} - 노트 배열 [{time, key}, ...]
   */
  async detectBeats(audioPath) {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // 파일 로드
    const response = await fetch(audioPath);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    
    // 모노로 변환
    const monoData = this.convertToMono(audioBuffer);
    
    // 피크 감지
    const peaks = this.findPeaks(monoData, audioBuffer.sampleRate);
    
    // 노트 패턴 생성
    const notes = this.generateNotes(peaks);
    
    audioContext.close();
    return notes;
  }

  /**
   * 스테레오 → 모노 변환
   */
  convertToMono(audioBuffer) {
    const numberOfChannels = audioBuffer.numberOfChannels;
    
    if (numberOfChannels === 1) {
      return audioBuffer.getChannelData(0);
    }
    
    const left = audioBuffer.getChannelData(0);
    const right = audioBuffer.getChannelData(1);
    const mono = new Float32Array(left.length);
    
    for (let i = 0; i < left.length; i++) {
      mono[i] = (left[i] + right[i]) / 2;
    }
    
    return mono;
  }

  /**
   * 볼륨 피크 찾기
   */
  findPeaks(monoData, sampleRate) {
    const peaks = [];
    const chunkSize = Math.floor(sampleRate * 0.05);  // 50ms 단위로 분석
    const minSamples = Math.floor(sampleRate * this.minInterval / 1000);
    
    let lastPeakIndex = -minSamples;
    
    // 전체 평균 볼륨 계산
    let totalSum = 0;
    for (let i = 0; i < monoData.length; i++) {
      totalSum += Math.abs(monoData[i]);
    }
    const avgVolume = totalSum / monoData.length;
    const dynamicThreshold = avgVolume * (1 + this.threshold);
    
    // 청크별로 분석
    for (let i = 0; i < monoData.length; i += chunkSize) {
      // 현재 청크의 볼륨 계산
      let chunkSum = 0;
      const end = Math.min(i + chunkSize, monoData.length);
      
      for (let j = i; j < end; j++) {
        chunkSum += Math.abs(monoData[j]);
      }
      
      const chunkAvg = chunkSum / (end - i);
      
      // 임계값 넘고, 최소 간격 지났으면 피크!
      if (chunkAvg > dynamicThreshold && (i - lastPeakIndex) > minSamples) {
        const timeInSeconds = i / sampleRate;
        peaks.push(timeInSeconds);
        lastPeakIndex = i;
      }
    }
    
    return peaks;
  }

  /**
   * 피크 → 노트 패턴 변환
   */
  generateNotes(peaks) {
    const keys = ['D', 'F', 'J', 'K'];  // 4개 키
    const notes = [];
    
    for (let i = 0; i < peaks.length; i++) {
      // 간단한 패턴: 순서대로 키 배정 (나중에 더 스마트하게 개선 가능)
      const keyIndex = i % keys.length;
      
      notes.push({
        time: peaks[i],
        key: keys[keyIndex]
      });
    }
    
    return notes;
  }

  /**
   * 노트 배열 → 텍스트 파일 형식으로 변환
   */
  exportToText(notes) {
    return notes.map(note => `${note.time.toFixed(3)},${note.key}`).join('\n');
  }
}

// 난이도 프리셋
const DIFFICULTY = {
  EASY: { threshold: 0.8, minInterval: 500 },    // 노트 적음
  NORMAL: { threshold: 0.5, minInterval: 300 },  // 보통
  HARD: { threshold: 0.3, minInterval: 150 }     // 노트 많음
};

module.exports = { BeatDetector, DIFFICULTY };
