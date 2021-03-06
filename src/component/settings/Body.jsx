import React, { Fragment, useState, useEffect, useContext } from 'react'
import { withRouter } from 'react-router-dom';
import { Container, Row, Col, Spinner, Form, Button, Table } from 'react-bootstrap'
import { RegisterFormStyle } from '../styles/style'
import { Members } from '../globals/Members'
import { MEMBERS_LINK, USER_LINK, ADMIN_MEMBERS_LINK, USER_SEARCH_LINK, USER_TRANSFER_LINK } from '../globals/links'
import { UserListContext, ErrorContext } from '../Context/Context'
import WebService from '../globals/WebService'
import Tree from 'react-hierarchy-tree';
import ErrorDisplay from '../globals/Error';
import { Icon } from 'react-icons-kit'
import { longArrowRight } from 'react-icons-kit/fa/longArrowRight'
import { default as localforage } from 'localforage';
import FundTransfers from '../transactions/FundTransfers';

const Body = (props) => {
    let [user, setUser] = useContext(UserListContext);
    const [error, setError] = useContext(ErrorContext);
    let [firstname, updateFirstname] = useState('');
    let [lastname, updateLastname] = useState('');
    let [dob, updateDob] = useState('');
    let [image, updateImage] = useState('')
    let [gender, updateGender] = useState('')
    let [phone, updatePhone] = useState('')
    let [bankName, updateBankName] = useState('')
    let [accountName, updateAccountName] = useState('')
    let [accountNumber, updateAccountNumber] = useState('')
    let [loading, updateLoading] = useState(false)
    let [userLoading, updateUserLoading] = useState(false)
    let [accountLoading, updateAccountLoading] = useState(false)
    let [offset, updateOffset] = useState(0)
    let [memberCurrentPage, updateMemberCurrentPage] = useState(1)
    let [memberTotalPages, updateMemberTotalPages] = useState('')

    let [searchTerm, updateSearchTerm] = useState('')
    let [memberSearchResult, updateMemberSearchResult] = useState([])
    let [emptyMemberMessage, updateEmptyMemberMessage] = useState()
    let [table, updateTable] = useState()
    let [enableSearch, updateEnableSearch] = useState(false)

    let [oldPassword, updateOldPassword] = useState('');
    let [newPassword, updateNewPassword] = useState('');
    let [confirmPassword, updateConfirmPassword] = useState('');

    let [active, updateActive] = useState(1)

    let service = new WebService();
    let [accountInfo, updateAccountInfo] = useState([])
    const fetchMember = async () => {
        updateLoading(true)
        let result = await service.sendGet(`${MEMBERS_LINK}/${user.user_id}`)
        let { data } = result
        updateAccountInfo(data)
        updateLoading(false)

    }

    const fetchFundsMember = async () => {
        if (searchTerm.trim() == "") {
            setError({
                show: true,
                isError: true,
                message: 'Search field is empty'
            })
        } else {
            setError({
                show: false,
                isError: false,
                message: ''
            })
            updateLoading(true)
            let result = await service.sendGet(`${USER_SEARCH_LINK}/${searchTerm}?offset=${offset}`)
            let { data: { rows, count } } = result
            if (rows.length > 0) {
                updateMemberSearchResult(rows)
                let pages = Math.ceil(Number(count) / 10)
                updateMemberTotalPages(pages)
            } else {
                updateMemberSearchResult([])
                updateEmptyMemberMessage(`${searchTerm.toLocaleUpperCase()} not found`);
            }
            updateLoading(false)
        }
    }
    useEffect(() => {
        setError({
            show: false,
            isError: false,
            message: ''
        })
        if (active == 2) {

            fetchMember()
        }
        if (active == 3) {

        }

        if (searchTerm != "") {
            fetchFundsMember()
        }
    }, [active, offset])

    const submitForm = async (e) => {
        e.preventDefault()
        let { id } = e.target
        switch (id) {
            case "accountSubmit":
                if (bankName.trim() == '' && accountName.trim() == '' && accountNumber == '') {
                    setError({
                        show: true,
                        isError: true,
                        message: 'All inputs are missing'
                    })
                } else if (accountNumber !== '' && accountNumber.length !== 10) {
                    setError({
                        show: true,
                        isError: true,
                        message: 'Invalid Account Number'
                    })
                } else {
                    setError({
                        show: false,
                        isError: false,
                        message: ''
                    })
                    updateAccountLoading(true)

                    let result = await service.sendPut(MEMBERS_LINK, { userId: user.user_id, accountName, accountNumber, bankName })
                    if (result.status == 200) {
                        let { data } = result
                        updateAccountNumber('')
                        updateBankName('')
                        updateAccountName('')
                        updateAccountInfo(data)

                    } else {
                        setError({
                            show: true,
                            isError: true,
                            message: result.response.data ? result.response.data : 'An error occured'
                        })
                    }
                    updateAccountLoading(false)

                }
                break;
            case "Submit":
                if (firstname.trim() == '' && lastname.trim() == '' && phone == '' && gender == '' && dob == '' && image == '') {
                    setError({
                        show: true,
                        isError: true,
                        message: 'All inputs are missing'
                    })
                } else if (phone !== '' && phone.length != 11) {
                    setError({
                        show: true,
                        isError: true,
                        message: 'Phone number must be 11 characters long'
                    })
                } else {

                    setError({
                        show: false,
                        isError: false,
                        message: ''
                    })
                    updateUserLoading(true)
                    let dataToSend = new FormData()
                    image !== '' ? dataToSend.append("userImage", image) : null
                    dataToSend.append("userId", user.user_id)
                    dataToSend.append("firstname", firstname)
                    dataToSend.append("lastname", lastname)
                    dataToSend.append("phone", phone)
                    dataToSend.append("gender", gender)
                    dataToSend.append("dob", dob)

                    let result = await service.sendPut(USER_LINK, dataToSend)
                    // console.log(result)
                    if (result.status == 200) {
                        let { data } = result
                        setError({
                            show: true,
                            isError: false,
                            message: 'Success'
                        })

                        localforage.setItem('user', data)
                            .then((value) => {
                                setUser(data)
                                updatePhone('')
                                updateFirstname('')
                                updateImage('')
                                updateGender('')
                                updateDob('')
                                updateLastname('')
                            })
                    } else {
                        setError({
                            show: true,
                            isError: true,
                            message: result.response.data ? result.response.data : 'An error occured'
                        })
                    }
                    updateUserLoading(false)

                }

                break;
            case "changePassword":
                if(oldPassword.trim() == "" || newPassword.trim() == "" || confirmPassword.trim() == ""){
                    setError({
                        isError: true,
                        message: "One or more parameters are missing",
                        show: true
                    })
                } else if(newPassword !== confirmPassword){
                    setError({
                        isError: true,
                        message: "Password don't match",
                        show: true
                    })
                }else{
                    setError({
                        isError: false,
                        message: "",
                        show: false
                    })
                    updateUserLoading(true)

                    try {
                        let result = await service.sendPut(`${USER_LINK}/${user.user_id}/changePassword`,{oldPassword, newPassword})
                        if(result.status == 200){
                            localforage.removeItem('user')
                                    .then((value) => {
                                        props.history.replace('/');
                                    })
                        }else{
                            setError({
                                show: true,
                                isError: true,
                                message: result.response ? result.response.data : 'An error occured'
                            })
                        }                        
                    } catch (error) {
                        setError({
                            show: true,
                            isError: true,
                            message: error.toString()
                        })
                    }

                    updateUserLoading(false)

                }
                break;
            default:
                break;
        }
    }

    const handleChange = ({ target }) => {
        let { name, value } = target;
        switch (name) {
            case "firstname":
                updateFirstname(value)
                break;
            case "lastname":
                updateLastname(value)
                break;
            case "image":
                updateImage(target.files[0])
                break;
            case "gender":
                updateGender(value)
                break;
            case "dob":
                updateDob(value)
                break;
            case "phone":
                updatePhone(value)
                break;
            case "accountNumber":
                updateAccountNumber(value)
                break;
            case "accountName":
                updateAccountName(value)
                break;
            case "bankName":
                updateBankName(value)
                break;
            case "searchTerm":
                updateSearchTerm(value)
                break;
            case "oldPassword":
                updateOldPassword(value);
                break;
            case "newPassword":
                updateNewPassword(value);
                break;
            case "confirmPassword":
                updateConfirmPassword(value);
                break;
            default:
                break;
        }
    }

    const switchTabs = async ({ target }) => {
        let { id } = target;
        switch (id) {
            case 'personal':
                active !== 1 ? updateActive(1) : null;
                break;
            case 'account':
                active !== 2 ? updateActive(2) : null;
                break;
            case 'transfer':
                active !== 3 ? updateActive(3) : null;
                break;
            default:
                break;
        }
    }

    const fundUserAccount = async (e) => {
        e.preventDefault();
        e.persist();
        let { number } = table
        let { id } = e.target
        let amountValue, receiverName
        if (number.length > 1) {
            number.forEach((num) => {
                if (id == num.dataset.id) {
                    amountValue = num.value
                    receiverName = num.dataset.name
                }
            })
        } else {

            amountValue = number.value
            receiverName = number.dataset.name
        }
        if (amountValue == undefined || amountValue.trim() == "") {
            setError({
                show: true,
                isError: true,
                message: 'Amount Can not be empty'
            })
        } else if (amountValue < 1) {
            setError({
                show: true,
                isError: true,
                message: 'Amount Can not be less than $1'
            })
        } else {
            setError({
                show: false,
                isError: false,
                message: ''
            })

            let conf = confirm(`Continue transfer to ${receiverName}? This action can not be reversed`)
            if (conf) {
                updateEnableSearch(true)

                let dataToSend = {
                    senderId: user.user_id,
                    senderName: `${user.firstname} ${user.lastname}`,
                    receiverName: receiverName,
                    amount: amountValue
                }

                e.target.value = "Sending..."
                e.target.disabled = true
                let result = await service.sendPost(`${USER_TRANSFER_LINK}/${id}`, dataToSend)
                if (result.status == 200) {
                    let { data } = result
                    setError({
                        show: true,
                        isError: false,
                        message: data
                    })
                    if (number.length > 1) {
                        number.forEach((num) => {
                            if (id == num.dataset.id) {
                                num.value = 0
                            }
                        })
                    } else {
                        number.value = 0
                    }
                } else {
                    setError({
                        show: true,
                        isError: true,
                        message: result.response ? result.response.data : 'An error occured'
                    })
                }
                e.target.disabled = false
                updateEnableSearch(false)
            }
        }
    }
    return (
        <Row>
            {loading ? (
                <Col className="text-center">
                    <Spinner animation="border" variant="success" />

                </Col>
            ) : (
                    <>
                        <Col lg={12}>

                            <Container fluid={true}>
                                <Row >
                                    <Col lg={4} md={4} sm={3} xs={12} onClick={switchTabs} style={{ color: active == 1 ? '#49C5A1' : '#B8C5D3' }} id="personal">Personal Details</Col>
                                    {user.role.name == 'Admin' ? (null) : (
                                        <Col lg={4} md={4} sm={3} xs={12} onClick={switchTabs} style={{ color: active == 2 ? '#49C5A1' : '#B8C5D3' }} id="account">Account Details</Col>
                                    )}
                                    <Col lg={4} md={4} sm={3} xs={12} onClick={switchTabs} style={{ color: active == 3 ? '#49C5A1' : '#B8C5D3' }} id="transfer">Change Password</Col>

                                </Row>
                                <br />
                                <RegisterFormStyle style={{ display: active == 1 ? 'block' : 'none' }}>
                                    <Col>
                                        {error.show ? (
                                            <ErrorDisplay message={error.message} error={error.isError} />
                                        ) : null}
                                    </Col>
                                    <Container fluid={true}>
                                        <Row>
                                            <Col lg={6} md={6} sm={6}>
                                                <Table striped responsive hover>
                                                    <thead>
                                                        <tr>
                                                            <th>Personal Information</th>
                                                            <th></th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr>
                                                            <td>Firstname</td>
                                                            <td>{user.firstname}</td>
                                                        </tr>
                                                        <tr>
                                                            <td>Lastname</td>
                                                            <td>{user.lastname}</td>
                                                        </tr>
                                                        <tr>
                                                            <td>Phone Number</td>
                                                            <td>{user.phone_no}</td>
                                                        </tr>
                                                        <tr>
                                                            <td>Gender</td>
                                                            <td>{user.gender}</td>
                                                        </tr>
                                                        <tr>
                                                            <td>Date of Birth</td>
                                                            <td>{user.dob}</td>
                                                        </tr>
                                                    </tbody>
                                                </Table>
                                            </Col>
                                            <Col lg={6} md={6} sm={6}>
                                                <h5>Edit </h5>
                                                <Form>
                                                    <Row>
                                                        <Col lg={12} >
                                                            <Form.Group>
                                                                <Form.Label>Firstname</Form.Label>
                                                                <Form.Control type="text" placeholder="Firstname" value={firstname} name="firstname" onChange={handleChange} />
                                                            </Form.Group>
                                                        </Col>
                                                        <Col lg={12} >
                                                            <Form.Group>
                                                                <Form.Label>Lastname</Form.Label>
                                                                <Form.Control type="text" placeholder="Lastname" value={lastname} name="lastname" onChange={handleChange} />
                                                            </Form.Group>
                                                        </Col>
                                                        <Col lg={12} >
                                                            <Form.Group>
                                                                <Form.Label>DOB</Form.Label>
                                                                <Form.Control type="date" name="dob" value={dob} onChange={handleChange} />
                                                            </Form.Group>
                                                        </Col>
                                                        <Col lg={12}>
                                                            <Form.Group>
                                                                <Form.Label>Gender</Form.Label>
                                                                <Form.Control onChange={handleChange} as="select" name="gender">
                                                                    <option value="">Select Gender</option>
                                                                    <option value="Male">Male</option>
                                                                    <option value="Female">Female</option>
                                                                </Form.Control>
                                                            </Form.Group>
                                                        </Col>
                                                        <Col lg={12} >
                                                            <Form.Group>
                                                                <Form.Label>Phone</Form.Label>
                                                                <Form.Control type="number" value={phone} placeholder="Phone no" name="phone" min="0" onChange={handleChange} />
                                                            </Form.Group>
                                                        </Col>
                                                        <Col lg={12}>
                                                            <Form.Group>
                                                                <Form.Label>Display Photo</Form.Label>
                                                                <Form.Control type="file" name="image" accept='image/*' onChange={handleChange} />
                                                            </Form.Group>
                                                        </Col>
                                                        <Col className="text-right" lg={12} md={12} sm={12}>
                                                            <Button id="Submit">
                                                                {userLoading ? (
                                                                    <>
                                                                        <Spinner
                                                                            as="span"
                                                                            animation="grow"
                                                                            size="sm"
                                                                            role="status"
                                                                            aria-hidden="true"
                                                                        />
                                                                        <span style={{ marginRight: "5px" }}>
                                                                            Loading ....
                                                                        </span>
                                                                    </>
                                                                ) : (
                                                                        <>
                                                                            <span style={{ marginRight: "5px" }} onClick={submitForm} id="Submit">
                                                                                Update
                                                                            </span>
                                                                            <Icon size={'12px'} icon={longArrowRight} onClick={submitForm} id="Submit" />

                                                                        </>

                                                                    )}
                                                            </Button>
                                                        </Col>
                                                    </Row>
                                                </Form>
                                            </Col>
                                        </Row>
                                    </Container>
                                </RegisterFormStyle>
                                <RegisterFormStyle style={{ display: active == 2 ? 'block' : 'none' }}>

                                    <Col>
                                        {error.show ? (
                                            <ErrorDisplay message={error.message} error={error.isError} />
                                        ) : null}
                                    </Col>
                                    <Container fluid={true}>
                                        <Row>

                                            <Col lg={6} md={6} sm={6}>
                                                <Table striped responsive hover>
                                                    <thead>
                                                        <tr>
                                                            <th>Account Information</th>
                                                            <th></th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr>
                                                            <td>Account Name</td>
                                                            <td>{accountInfo.account_name !== null ? (accountInfo.account_name) : (<i>None</i>)}</td>
                                                        </tr>
                                                        <tr>
                                                            <td>Account Number</td>
                                                            <td>{accountInfo.account_number !== null ? (accountInfo.account_number) : (<i>None</i>)}</td>
                                                        </tr>
                                                        <tr>
                                                            <td>Bank Name</td>
                                                            <td>{accountInfo.bank_name !== null ? (accountInfo.bank_name) : (<i>None</i>)}</td>
                                                        </tr>
                                                    </tbody>
                                                </Table>
                                            </Col>
                                            <Col lg={6} md={6} sm={6}>
                                                <Form>
                                                    <Row>
                                                        <Col lg={12} >
                                                            <Form.Group>
                                                                <Form.Label>Bank Name</Form.Label>
                                                                <Form.Control type="text" placeholder="Bank Name" value={bankName} name="bankName" min="0" onChange={handleChange} />
                                                            </Form.Group>
                                                        </Col>
                                                        <Col lg={12} >
                                                            <Form.Group>
                                                                <Form.Label>Account Name</Form.Label>
                                                                <Form.Control type="text" placeholder="Account Name" value={accountName} name="accountName" onChange={handleChange} />
                                                            </Form.Group>
                                                        </Col>
                                                        <Col lg={12} >
                                                            <Form.Group>
                                                                <Form.Label>Account Number</Form.Label>
                                                                <Form.Control type="number" placeholder="Account Number" value={accountNumber} name="accountNumber" min="0" onChange={handleChange} />
                                                            </Form.Group>
                                                        </Col>

                                                        <Col className="text-right" >
                                                            <Button id="Submit">
                                                                {accountLoading ? (
                                                                    <>
                                                                        <Spinner
                                                                            as="span"
                                                                            animation="grow"
                                                                            size="sm"
                                                                            role="status"
                                                                            aria-hidden="true"
                                                                        />
                                                                        <span style={{ marginRight: "5px" }}>
                                                                            Loading ....
                                                                </span>
                                                                    </>
                                                                ) : (
                                                                        <>
                                                                            <span style={{ marginRight: "5px" }} onClick={submitForm} id="accountSubmit">
                                                                                Apply
                                                                    </span>
                                                                            <Icon size={'12px'} icon={longArrowRight} onClick={submitForm} id="accountSubmit" />

                                                                        </>

                                                                    )}
                                                            </Button>
                                                        </Col>
                                                    </Row>
                                                </Form>
                                            </Col>
                                        </Row>
                                    </Container>
                                </RegisterFormStyle>
                                <RegisterFormStyle style={{ display: active == 3 ? 'block' : 'none' }}>
                                    <Col>
                                        {error.show ? (
                                            <ErrorDisplay message={error.message} error={error.isError} />
                                        ) : null}
                                    </Col>
                                    <Form>
                                        <Row>
                                            <Col lg={6} >
                                                <Form.Group>
                                                    <Form.Label>Old Password</Form.Label>
                                                    <Form.Control type="password" placeholder="Old Password" value={oldPassword} name="oldPassword" onChange={handleChange} />
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col lg={6} >
                                                <Form.Group>
                                                    <Form.Label>New Password</Form.Label>
                                                    <Form.Control type="password" placeholder="New Password" value={newPassword} name="newPassword" onChange={handleChange} />
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col lg={6} >
                                                <Form.Group>
                                                    <Form.Label>Confirm Password</Form.Label>
                                                    <Form.Control type="password" placeholder="Confirm Password" value={confirmPassword} name="confirmPassword" onChange={handleChange} />
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                        <Row>

                                            <Col lg={12} md={12} sm={12}>
                                                <Button id="Submit">
                                                    {userLoading ? (
                                                        <>
                                                            <Spinner
                                                                as="span"
                                                                animation="grow"
                                                                size="sm"
                                                                role="status"
                                                                aria-hidden="true"
                                                            />
                                                            <span style={{ marginRight: "5px" }}>
                                                                Loading ....
                                                                        </span>
                                                        </>
                                                    ) : (
                                                            <>
                                                                <span style={{ marginRight: "5px" }} onClick={submitForm} id="changePassword">
                                                                    Change Password
                                                                            </span>
                                                                <Icon size={'12px'} icon={longArrowRight} onClick={submitForm} id="changePassword" />

                                                            </>

                                                        )}
                                                </Button>
                                            </Col>
                                        </Row>
                                    </Form>

                                </RegisterFormStyle>

                            </Container>
                        </Col>
                    </>
                )}
        </Row>

    )
}

export default withRouter(Body);