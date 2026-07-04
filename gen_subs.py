
import asyncio
import edge_tts

text = 'Hello there... and welcome to my world. Let\'s explore my world and all. I am Manohar Tej, a Computer Science Engineering student, a developer, and someone who truly enjoys turning ideas into meaningful digital experiences. Ever since I started exploring technology, I have been fascinated by one simple question: What if I could build something that people would actually enjoy using? That curiosity slowly became a passion. Today, I spend my time designing websites, building intelligent applications, experimenting with AI, and constantly learning new technologies. But for me, programming is not just about writing code. It is about solving problems, creating experiences, and bringing imagination to life. Every project I build teaches me something new. Every challenge helps me grow. And every line of code takes me one step closer to becoming the engineer I aspire to be. So...'

async def generate():
    communicate = edge_tts.Communicate(text, 'en-US-ChristopherNeural')
    submaker = edge_tts.SubMaker()
    with open('public/speech.mp3', 'wb') as file:
        async for chunk in communicate.stream():
            if chunk['type'] == 'audio':
                file.write(chunk['data'])
            elif chunk['type'] == 'WordBoundary':
                submaker.create_sub((chunk['offset'], chunk['duration']), chunk['text'])
    with open('public/speech.vtt', 'w', encoding='utf-8') as file:
        file.write(submaker.generate_subs())

asyncio.run(generate())

