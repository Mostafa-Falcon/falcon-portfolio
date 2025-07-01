import React from 'react'
import { Spotlight } from './ui/spotlight-new'
import { GridBackground } from './ui/GridBackground'
import { TextGenerateEffect } from './ui/text-generate-effect'
import MagicButton from './ui/MagicButton'
import { FaLocationArrow } from 'react-icons/fa6'

const Hero = () => {
    return (
        <div className='pb-20 pt-36'>
            <div>
                <Spotlight />
            </div>
            <GridBackground />

            <div className="flex justify-center relative my-20 z-10">
                <div className="max-w-[89vw] md:max-w-2xl lg:max-w-[60vw] flex flex-col items-center justify-center">
                    <h2 className="uppercase tracking-widest text-xs text-center text-blue-100 max-w-80">
                        Dynamic Web Magic with Next.js
                    </h2>

                    <TextGenerateEffect
                        className='text-center text-[40px] md:text-5xl lg:text-6xl'
                        words='Transforming Concepts into Seamless User Experiences'
                    />

                    <p className='text-center md:tracking-wider mb-4 text-sm md:text-lg lg:text-2xl'>
                        Hi, I&apos;m Mostafa Falcon, a Next.js Developer based in Egypt
                    </p>

                    <a>
                        <MagicButton
                            title='Show my work'
                            position='right'
                            icon={<FaLocationArrow />}
                        />
                    </a>
                </div>
            </div>
        </div>
    )
}

export default Hero
