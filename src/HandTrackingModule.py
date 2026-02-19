from turtle import distance
import mediapipe as mp
import cv2
import math

class hand_Detector:
    def __init__(self, mode=False, max_hands=2, detection_confidence=0.5,tracking_confidence=0.5):
        self.mode = mode # Define o modo de detecção (estático ou dinâmico) False para detecção dinâmica, True para detecção estática
        self.max_hands = max_hands # Define o número máximo de mãos a serem detectadas
        self.detection_confidence = detection_confidence # Define a confiança mínima para a detecção de mãos (0.0 a 1.0)
        self.tracking_confidence = tracking_confidence # Define a confiança mínima para o rastreamento de mãos (0.0 a 1.0)

        self.mp_hands = mp.solutions.hands # Inicializa o módulo de detecção de mãos do MediaPipe
        
        self.hands = self.mp_hands.Hands(
            static_image_mode=self.mode,
            max_num_hands=self.max_hands,
            model_complexity=1,  
            min_detection_confidence=self.detection_confidence,
            min_tracking_confidence=self.tracking_confidence
        ) # Cria uma instância do detector de mãos com as configurações especificadas

        self.mp_draw = mp.solutions.drawing_utils # Inicializa o módulo de utilitários de desenho do MediaPipe para desenhar os pontos de referência e conexões das mãos
        self.tipIds = [4, 8, 12, 16, 20] # Lista de IDs dos pontos de referência das pontas dos dedos (polegar, indicador, médio, anelar e mínimo)
        
    def find_hands(self, img, draw=True):
        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB) # Converte a imagem de BGR para RGB, pois o MediaPipe espera imagens no formato RGB
        self.results = self.hands.process(img_rgb) # Processa a imagem para detectar as mãos
        # print(self.results.multi_hand_landmarks) # Imprime os pontos de referência das mãos detectadas
        if self.results.multi_hand_landmarks: # Verifica se foram detectadas mãos
            for handLms in self.results.multi_hand_landmarks: # Para cada mão detectada
                # print(handLms.landmark) # Imprime os pontos de referência da mão
                if draw: # Se o parâmetro draw for True, desenha os pontos de referência e as conexões da mão na imagem
                    self.mp_draw.draw_landmarks(img, handLms, self.mp_hands.HAND_CONNECTIONS)
                    # print(img.shape)
        return img

    def get_handcoordinates(self, img):
        lmList = [] # Lista para armazenar as coordenadas dos pontos de referência da mão
        if self.results.multi_hand_landmarks: # Verifica se foram detectadas mãos
            for handLms in self.results.multi_hand_landmarks: # Para cada mão detectada
                for id, lm in enumerate(handLms.landmark): # Para cada ponto de referência da mão
                    h, w, c = img.shape # Obtém as dimensões da imagem
                    cx, cy = int(lm.x * w), int(lm.y * h) # Converte as coordenadas normalizadas para coordenadas de pixel
                    lmList.append([id, cx, cy]) # Adiciona o ID e as coordenadas do ponto de referência à lista
        return lmList # Retorna a lista de coordenadas dos pontos de referência da mão
    
    def fingers_up(self):
        fingers = [] # Lista para armazenar o estado dos dedos (1 para levantado, 0 para abaixado)
        if self.results.multi_hand_landmarks: # Verifica se foram detectadas mãos
            handLms = self.results.multi_hand_landmarks[0] # Considera apenas a primeira mão detectada
            # Verifica o estado do polegar
            if handLms.landmark[self.tipIds[0]].x > handLms.landmark[self.tipIds[0] - 1].x:
                fingers.append("Polegar Levantado") # Polegar levantado
            else:
                fingers.append(0) # Polegar abaixado
            # Verifica o estado dos outros dedos
            for id in range(1, 5):
                if handLms.landmark[self.tipIds[id]].y < handLms.landmark[self.tipIds[id] - 2].y:
                    fingers.append("Dedo Levantado") # Dedo levantado
                else:
                    fingers.append(0) # Dedo abaixado
        return fingers # Retorna a lista de estados dos dedos
    def find_distance(self,lmList, p1, p2):
        if len(lmList) != 0:
            x1, y1 = lmList[p1][1], lmList[p1][2] # Obtém as coordenadas do ponto de referência p1
            x2, y2 = lmList[p2][1], lmList[p2][2] # Obtém as coordenadas do ponto de referência p2
            dist = math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2) # Calcula a distância euclidiana entre os pontos p1 e p2
            return dist # Retorna a distância entre os pontos p1 e p2
    
def main():
    cap= cv2.VideoCapture(0) # 0 é o índice da câmera padrão
    detector = hand_Detector() # Cria uma instância do detector de mãos
    while True: # Loop infinito para capturar vídeo
        success, img = cap.read() # Lê um frame do vídeo
        if not success:
            break # Se não conseguir ler o frame, sai do loop
        img = detector.find_hands(img) # Detecta as mãos no frame
        lmList = detector.get_handcoordinates(img)
        # print(lmList) # Imprime as coordenadas dos pontos de referência da mão
        fingers = detector.fingers_up()
        print(fingers)
        print(lmList)
        distance = detector.find_distance(lmList,4,8)
        print(f'Distância entre o polegar e o indicador: {distance}') # Imprime a distância entre o polegar e o indicador
        cv2.imshow("Image", img) # Exibe o frame com as mãos detectadas
        if cv2.waitKey(1) & 0xFF == ord('q'): # Sai do loop se a tecla 'q' for pressionada
            break


main()