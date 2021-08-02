import React, { useCallback, useState } from 'react'
import { Formik } from 'formik'
import { Form, OverlayTrigger, Tooltip } from 'react-bootstrap'
import { Store } from 'types/contenful.types'
import * as yup from 'yup'
import cn from 'classnames'
import { FeedbackFormType } from 'server/models/feedback'
import { useShopifyEmbed } from 'client/hooks/use-shopify-embed.hook'
import axios from 'axios'
import styles from './feedback-popup.module.scss'

type FeedbackProps = {
  showFeedbackPopup: boolean
  toggleFeedbackPopup: () => void
  store: Store
}

const schema = yup.object().shape({
  email: yup.string().email('Invalid email').required('Required'),
  message: yup.string().required('Required')
})

const FeedbackPopup: React.FC<FeedbackProps> = ({ showFeedbackPopup, toggleFeedbackPopup, store }) => {
  const { customer } = useShopifyEmbed()
  const [isSending, setSending] = useState(false)

  const loadingAnimation = useCallback(() => {
    setTimeout(() => {
      setSending(false)
      toggleFeedbackPopup()
    }, 700)
  }, [toggleFeedbackPopup])

  const sendFormFeedback = useCallback(
    async (formData: FeedbackFormType, { resetForm }: any) => {
      setSending(true)
      return axios
        .post('/api/customer/feedback', formData)
        .then(() => {
          resetForm({ storeId: store.storeId, feedbackValue: '3', message: '', email: '' })
          loadingAnimation()
        })
        .catch((err) => {
          console.error(err)
          setSending(false)
        })
    },
    [loadingAnimation, store.storeId]
  )

  return (
    <div className={styles.feedbackContainer}>
      <Formik
        onSubmit={sendFormFeedback}
        validationSchema={schema}
        validateOnChange={false}
        validateOnBlur={false}
        enableReinitialize
        initialValues={{
          storeId: store.storeId,
          feedbackValue: '3',
          message: '',
          email: customer?.email ?? ''
        }}
      >
        {({ handleSubmit, handleChange, values, touched, errors }) => (
          <Form onSubmit={handleSubmit}>
            <div
              className={cn(styles.cardContainer, showFeedbackPopup ? '' : styles.hidePopup, 'card text-dark bg-light')}
            >
              <Form.Group className={cn(styles.emojiRow)}>
                <Form.Check
                  className={styles.formCheck}
                  type="radio"
                  id="emoji-radio-select-1"
                  name="feedbackValue"
                  value="1"
                  checked={values.feedbackValue === '1'}
                  onChange={handleChange}
                  label={
                    <div className={cn(styles.emoji, values.feedbackValue === '1' ? styles.checkedEmoji : '')}>
                      <span role="img" aria-label="Smiling Face with Sunglasses">
                        😎
                      </span>
                    </div>
                  }
                />
                <Form.Check
                  className={styles.formCheck}
                  type="radio"
                  id="emoji-radio-select-2"
                  name="feedbackValue"
                  value="2"
                  checked={values.feedbackValue === '2'}
                  onChange={handleChange}
                  label={
                    <div className={cn(styles.emoji, values.feedbackValue === '2' ? styles.checkedEmoji : '')}>
                      <span role="img" aria-label="Slightly Smiling Face">
                        🙂
                      </span>
                    </div>
                  }
                />
                <Form.Check
                  className={cn(styles.formCheck)}
                  type="radio"
                  id="emoji-radio-select-3"
                  name="feedbackValue"
                  value="3"
                  checked={values.feedbackValue === '3'}
                  onChange={handleChange}
                  label={
                    <div className={cn(styles.emoji, values.feedbackValue === '3' ? styles.checkedEmoji : '')}>
                      <span role="img" aria-label="Neutral Face">
                        😐
                      </span>
                    </div>
                  }
                />
                <Form.Check
                  className={styles.formCheck}
                  type="radio"
                  id="emoji-radio-select-4"
                  name="feedbackValue"
                  value="4"
                  checked={values.feedbackValue === '4'}
                  onChange={handleChange}
                  label={
                    <div className={cn(styles.emoji, values.feedbackValue === '4' ? styles.checkedEmoji : '')}>
                      <span role="img" aria-label="Worried Face">
                        😟
                      </span>
                    </div>
                  }
                />
                <Form.Check
                  className={styles.formCheck}
                  type="radio"
                  id="emoji-radio-select-5"
                  name="feedbackValue"
                  value="5"
                  checked={values.feedbackValue === '5'}
                  onChange={handleChange}
                  label={
                    <div className={cn(styles.emoji, values.feedbackValue === '5' ? styles.checkedEmoji : '')}>
                      <span role="img" aria-label="Sad Pensive Face">
                        😞
                      </span>
                    </div>
                  }
                />
              </Form.Group>
              <Form.Group className={styles.textArea} controlId="exampleForm.ControlInput2">
                <Form.Control
                  className="inputName shadow-none"
                  type="text"
                  name="email"
                  value={values.email}
                  onChange={handleChange}
                  placeholder="Your E-mail"
                  isValid={touched.email && !errors.email}
                  isInvalid={!!errors.email}
                />
                <Form.Control.Feedback className={styles.formError} type="invalid">
                  {errors.email}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className={styles.textArea} controlId="contactForm.ControlTextarea1">
                <Form.Control
                  as="textarea"
                  placeholder="Give us some feedback!"
                  rows={5}
                  name="message"
                  onChange={handleChange}
                  value={values.message}
                  isValid={touched.message && !errors.message}
                  isInvalid={!!errors.message}
                />
                <Form.Control.Feedback className={styles.formError} type="invalid">
                  {errors.message}
                </Form.Control.Feedback>
              </Form.Group>

              <button className={cn(styles.h3, styles.submitButton)} type="submit">
                {isSending ? <div className={cn(styles.spinnerBorder, 'spinner-border')} role="status" /> : 'Submit'}
              </button>
              <a
                href="https://www.surveymonkey.com/r/TPDS597"
                target="_blank"
                rel="noreferrer"
                className={styles.takeSurveyLink}
              >
                Take a Survey!
              </a>
            </div>

            <OverlayTrigger
              placement="left"
              overlay={
                <Tooltip id="tooltip-left" className={cn(styles.feedbackButtonTooltip)}>
                  Share Feedback
                </Tooltip>
              }
            >
              <button className={styles.feedbackButton} type="button" onClick={() => toggleFeedbackPopup()}>
                <p>?</p>
              </button>
            </OverlayTrigger>
          </Form>
        )}
      </Formik>
    </div>
  )
}

export default FeedbackPopup
