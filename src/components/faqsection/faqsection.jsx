import { useState } from "react";
import SectionTitle from "../sectiontitle/sectiontitle";
import { useInView } from "../../hooks/useInView";
import "./faqsection.css";

import faqMain from "../../assets/image/faq-1-1.jpg";
import faqLeft from "../../assets/image/faq-1-2.jpg";
import faqRight from "../../assets/image/faq-1-3.jpg";
import faqShape from "../../assets/image/faq-1-shape.png";

const questions = [
  "How To Boost Media Performance On A Budget?",
  "As designers the responsibility?",
  "Improving Your Team’s Communication?",
  "Mproving Your Team’s Communication?",
  "Where should I incorporate my business?",
];

// cavab mətni (demo-da hamısında eynidir); sətirlər böyük ekranda ayrıca görünür
const ANSWER = [
  "Orttitor auctor dapibus. Mauris tempor tortor non consectetur luctus. Ut sit amet porta metus. Cras a",
  "mivelmaximnibhprofessor at Hampden-Sydney College in",
  "Virginia, loositesstill in their",
];

/*
  Sual-cavab siyahısı (demo-dakı travhub-accrodion kimi):
  - həmişə bir sual açıq olur (əvvəlcə birincisi)
  - başqa suala klikləyəndə köhnəsi yığılır, yenisi açılır (0.4s)
  - açıq suala yenidən klikləmək onu bağlamır
  - "+" işarəsi açıq sualda "−" olur
*/
function FaqAccordion() {
  const [open, setOpen] = useState(0);

  return (
    <div className="faq-accordion">
      {questions.map((question, i) => {
        const isOpen = open === i;

        return (
          <div key={question} className={`faq-item${isOpen ? " is-active" : ""}`}>
            <h3 className="faq-item__heading">
              <button
                type="button"
                id={`faq-question-${i}`}
                className="faq-item__title"
                aria-expanded={isOpen}
                aria-controls={`faq-answer-${i}`}
                onClick={() => setOpen(i)}
              >
                <span className="faq-item__question">{question}</span>
                <span className="faq-item__icon" aria-hidden="true" />
              </button>
            </h3>

            <div
              id={`faq-answer-${i}`}
              role="region"
              aria-labelledby={`faq-question-${i}`}
              className="faq-item__panel"
              inert={!isOpen}
            >
              <div className="faq-item__panel-inner">
                <p className="faq-item__answer">
                  {ANSWER.map((line, l) => (
                    <span key={l}>
                      {l > 0 && <br />}
                      {line}{" "}
                    </span>
                  ))}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function FaqSection() {
  const [leftRef, leftInView] = useInView(0.1);
  const [mediaRef, mediaInView] = useInView(0.3);

  return (
    <section className="faq-section">
      <div className="faq-section__container">
        <div className="faq-section__wrapper">
          <div className="faq-section__row">
            {/* sol: başlıq + suallar (soldan gəlir) */}
            <div ref={leftRef} className={`faq-section__content${leftInView ? " is-inview" : ""}`}>
              <SectionTitle align="left" subtitle="Faq" title={"Some Question\nAbout Us"} />
              <FaqAccordion />
            </div>

            {/* sağ: şəkillər (aşağıdan qalxır, kiçik dairələr bir az gec) */}
            <div className="faq-section__media-col">
              <div ref={mediaRef} className={`faq-media${mediaInView ? " is-inview" : ""}`}>
                <img className="faq-media__main" src={faqMain} alt="Dağda səyahət edən turist" />

                <div className="faq-media__circle faq-media__circle--left">
                  <img src={faqLeft} alt="" />
                </div>

                <div className="faq-media__circle faq-media__circle--right">
                  <img src={faqRight} alt="" />
                </div>

                <img className="faq-media__shape" src={faqShape} alt="" aria-hidden="true" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
