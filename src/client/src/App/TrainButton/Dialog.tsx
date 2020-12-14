import React from 'react'
import {
  Button,
  createStyles,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  fade,
  FormControl,
  InputBase,
  InputLabel,
  makeStyles,
  TextField,
  Theme,
} from '@material-ui/core'

interface Props {
  open: boolean
  onClose: () => any
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      'label + &': {
        marginTop: theme.spacing(3),
      },
    },
    input: {
      borderRadius: 4,
      position: 'relative',
      backgroundColor: theme.palette.common.white,
      border: '1px solid #ced4da',
      fontSize: 16,
      width: 'auto',
      padding: '10px 12px',
      transition: theme.transitions.create(['border-color', 'box-shadow']),
      // Use the system font instead of the default Roboto font.
      fontFamily: [
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
        '"Apple Color Emoji"',
        '"Segoe UI Emoji"',
        '"Segoe UI Symbol"',
      ].join(','),
      '&:focus': {
        boxShadow: `${fade(theme.palette.primary.main, 0.25)} 0 0 0 0.2rem`,
        borderColor: theme.palette.primary.main,
      },
    },
  })
)

export default function ScrollDialog({ open, onClose }: Props) {
  const classes = useStyles()
  // const descriptionElementRef = React.useRef<HTMLElement>(null)
  // React.useEffect(() => {
  //   if (open) {
  //     const { current: descriptionElement } = descriptionElementRef
  //     if (descriptionElement !== null) {
  //       descriptionElement.focus()
  //     }
  //   }
  // }, [open])

  const formItems = [
    { id: 'train_epochs', default: 500, type: 'string' },
    { id: 'do_fine_tuning', default: true, type: 'boolean' },
    { id: 'batch_size', default: 100, type: 'string' },
    { id: 'learning_rate', default: 0.005, type: 'string' },
    { id: 'momentum', default: 0.9, type: 'string' },
    { id: 'dropout_rate', default: 0.2, type: 'string' },
    { id: 'l1_regularizer', default: 0.0, type: 'string' },
    { id: 'l2_regularizer', default: 0.0001, type: 'string' },
    { id: 'label_smoothing', default: 0.1, type: 'string' },
    { id: 'validation_split', default: 0.2, type: 'string' },
    { id: 'do_data_augmentation', default: false, type: 'boolean' },
    { id: 'rotation_range', default: 40, type: 'string' },
    { id: 'horizontal_flip', default: true, type: 'boolean' },
    { id: 'width_shift_range', default: 0.2, type: 'string' },
    { id: 'height_shift_range', default: 0.2, type: 'string' },
    { id: 'shear_range', default: 0.2, type: 'string' },
    { id: 'zoom_range', default: 0.2, type: 'string' },
  ]

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Start a training run</DialogTitle>
      <DialogContent dividers={false}>
        <div>
          Training will temporarily connect this bucket to the Watson Machine
          Learning service. Your images and annotations will be used to create
          your own personal model.
        </div>
        <form noValidate autoComplete="off">
          {formItems.map((i) => (
            <div>
              <FormControl style={{ margin: '8px' }}>
                <InputLabel shrink htmlFor={i.id}>
                  {i.id}
                </InputLabel>
                <InputBase
                  id={i.id}
                  placeholder={i.default.toString()}
                  classes={classes}
                />
              </FormControl>
            </div>
          ))}
        </form>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" color="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="contained" color="primary" onClick={onClose}>
          Subscribe
        </Button>
      </DialogActions>
    </Dialog>
  )
}
