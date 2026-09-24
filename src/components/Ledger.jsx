import { motion } from 'framer-motion'
import ChapterCard from './ChapterCard'
import { CHAPTERS } from '../data/chapters'
import { LEDGER } from '../data/content'
import './Ledger.css'

const EASE = [0.22, 1, 0.36, 1]

/** Chapter IV: the cultivation status, inscribed row by row. */
export default function Ledger() {
    return (
        <section className="chapter ledger" id="ledger">
            <ChapterCard
                chapter={CHAPTERS[4]}
                index={4}
                quote="The Dao that can be compiled is not the Eternal Dao."
            />

            <div className="container ledger-body">
                <div className="ledger-head" role="presentation">
                    <span className="mono-label">Path of Cultivation</span>
                    <span className="mono-label">Current Realm</span>
                    <span className="mono-label">Power Level</span>
                </div>

                <div className="ledger-rows">
                    {LEDGER.map((row, i) => (
                        <motion.div
                            key={row.path}
                            className="ledger-row"
                            initial="hidden"
                            whileInView="show"
                            viewport={{ once: true, margin: '-15% 0px' }}
                        >
                            <motion.div
                                className="ledger-rule"
                                variants={{ hidden: { scaleX: 0 }, show: { scaleX: 1 } }}
                                transition={{ duration: 1.3, ease: EASE, delay: i * 0.08 }}
                            />
                            <span className="line-mask ledger-path">
                                <motion.span
                                    variants={{ hidden: { y: '110%' }, show: { y: '0%' } }}
                                    transition={{ duration: 1, ease: EASE, delay: 0.1 + i * 0.08 }}
                                >
                                    <span className="ledger-idx mono-label">0{i + 1}</span>
                                    {row.path}
                                </motion.span>
                            </span>
                            <motion.span
                                className="ledger-realm"
                                variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
                                transition={{ duration: 1, ease: EASE, delay: 0.25 + i * 0.08 }}
                            >
                                {row.realm}
                            </motion.span>
                            <div className="ledger-power">
                                <motion.span
                                    className="ledger-power-label"
                                    variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}
                                    transition={{ duration: 1, delay: 0.4 + i * 0.08 }}
                                >
                                    {row.power}
                                </motion.span>
                                <div className="ledger-bar">
                                    <motion.div
                                        className="ledger-bar-fill"
                                        variants={{ hidden: { scaleX: 0 }, show: { scaleX: row.level / 100 } }}
                                        transition={{ duration: 1.8, ease: EASE, delay: 0.35 + i * 0.08 }}
                                    />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <motion.blockquote
                    className="ledger-quote"
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-10% 0px' }}
                    transition={{ duration: 1.4, ease: EASE }}
                >
                    “The code is temporary, but the Logic is <em>Eternal.</em>”
                    <cite className="mono-label">Behold — I have yet to reach my final form.</cite>
                </motion.blockquote>
            </div>
        </section>
    )
}
