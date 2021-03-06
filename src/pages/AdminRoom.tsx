import { useHistory, useParams } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';

import logoImg from '../assets/images/logo.svg';
import deleteImg from '../assets/images/delete.svg';
import checkImg from '../assets/images/check.svg';
import answerImg from '../assets/images/answer.svg';
import emptyImg from '../assets/images/empty-questions.svg';
import excluirImg from '../assets/images/excluir.svg';
import encerrarImg from '../assets/images/encerrar.svg';
import { Button } from '../components/Button';
import { RoomCode } from '../components/RoomCode';
import { Question } from '../components/Question';
import { useRoom } from '../hooks/useRoom';
import { database } from '../services/firebase';

import '../styles/room.scss';

type RoomParams = {
    id: string;
}

export function AdminRoom() {
    const history = useHistory();
    const params = useParams<RoomParams>();
    const roomId = params.id;

    if (!roomId) {
        history.push('/');
    }

    const { title, questions } = useRoom(roomId);

    function handleEnd() {
        toast((t) => (
            <div id="Toast">
                <img src={encerrarImg} alt="excluir"/>
                <span>
                    Encerrar sala
                </span>
                <p>
                    Tem certeza que você
                </p>
                <p>
                    deseja encerrar esta sala?
                </p>
                <div>
                    <button onClick={() => toast.dismiss(t.id)}>
                        Cancelar
                    </button>
                    <button className="btYes" onClick={() => handleEndRoom() && toast.dismiss(t.id)}>
                        Sim, encerrar
                    </button>
                </div>
            </div>
        ));
    }

    async function handleEndRoom() {
        await database.ref(`rooms/${roomId}`).update({
            endedAt: new Date(),
        })

        history.push('/');
    }

    async function handleDeleteQuestion(questionId: string) {
        //*if (window.confirm('Tem certeza que você deseja excluir esta pergunta?')) { /** retorna um bool */
          //  await database.ref(`rooms/${roomId}/questions/${questionId}`).remove();
        //}
        toast((t) => (
            <div id="Toast">
                <img src={excluirImg} alt="excluir"/>
                <span>
                    Excluir pergunta
                </span>
                <p>
                    Tem certeza que você
                </p>
                <p>
                    deseja excluir esta pergunta? 
                </p>
                <div>
                    <button onClick={() => toast.dismiss(t.id)}>
                        Cancelar
                    </button>
                    <button className="btYes" onClick={() => database.ref(`rooms/${roomId}/questions/${questionId}`).remove() && toast.dismiss(t.id)}>
                        Sim, excluir
                    </button>
                </div>
            </div>
        ));
    }

    async function handleCheckQuestionAsAnswered(questionId: string) {
        await database.ref(`rooms/${roomId}/questions/${questionId}`).update({
            isAnswered: true,
        });
    }

    async function handleHighlightQuestion(questionId: string) {
        await database.ref(`rooms/${roomId}/questions/${questionId}`).update({
            isHighlighted: true,
        });
    }

    return (
        <div id="page-room">
            <div><Toaster /></div>
            <header>
                <div className="content">
                    <img src={logoImg} alt="Letmeask" />
                    <div>
                        <RoomCode code={roomId} />
                        <Button isOutlined onClick={handleEnd}>Encerrar sala</Button>
                    </div>
                </div>
            </header>

            <main>
                <div className="room-title">
                    <h1>Sala {title}</h1>
                    {questions.length > 0 && <span>{questions.length} pergunta(s)</span>}
                </div>
                {questions.length >= 1 ? (
                    <div className="question-list">
                        {questions.map(question => {
                            return (
                                <Question
                                    key={question.id}
                                    content={question.content}
                                    author={question.author}
                                    isAnswered={question.isAnswered}
                                    isHighlighted={question.isHighlighted}
                                >
                                    {!question.isAnswered && (
                                        <> {/** fragmento */}
                                            <button
                                                type="button"
                                                onClick={() => handleCheckQuestionAsAnswered(question.id)}
                                            >
                                                <img src={checkImg} alt="Marcar pergunta como respondida" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleHighlightQuestion(question.id)}
                                            >
                                                <img src={answerImg} alt="Dar destaque à pergunta" />
                                            </button>
                                        </>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => handleDeleteQuestion(question.id)}
                                    >
                                        <img src={deleteImg} alt="Remover pergunta" />
                                    </button>
                                </Question>
                            );
                        })}
                    </div>
                ) : (
                    <div className="empty">
                        <img src={emptyImg} alt="sem questão" />
                        <span>
                            Nenhuma pergunta por aqui...
                        </span>
                        <p>
                            Envie o código desta sala para seus amigos e comece a responder perguntas!
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
}